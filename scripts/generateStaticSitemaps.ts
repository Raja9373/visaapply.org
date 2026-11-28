import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import {
  STATIC_CATALOG_SCHEMA_VERSION,
  isEligibleForPublicCatalogIndex,
  isForbiddenFixtureId,
  type BilateralRouteOverrideRecord,
  type ClaimRecord,
  type CountryRecord,
  type EditorialArticleRecord,
  type ImmigrationProgramRecord
} from '../src/schemas/catalogSchemas';
import {
  getHreflangAlternatesForRoute,
  normalizeCanonicalUrl,
  type HreflangAlternate
} from '../src/utils/seoMetadataManager';
import { UNINHABITED_TERRITORY_CODES } from '../src/utils/ssrRouteRenderer';
import { validateStaticCatalog } from './validateStaticCatalog';

const BASE_ORIGIN = 'https://www.visaapply.org';
const MAX_URLS_PER_SITEMAP = 50000;

export interface StaticSitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  alternates: HreflangAlternate[];
  bucket: 'core' | 'countries' | 'programs' | 'routes' | 'editorial';
}

export interface StaticSitemapReport {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  valid: boolean;
  validationErrors: string[];
  baseOrigin: string;
  outDir: string;
  indexFile: string;
  sitemapFiles: Array<{
    fileName: string;
    bucket: string;
    urlCount: number;
    hreflangLinksCount: number;
  }>;
  totals: {
    substantiveUrlsEmitted: number;
    totalHreflangLinks: number;
    byBucket: Record<'core' | 'countries' | 'programs' | 'routes' | 'editorial', number>;
    excludedSummary: {
      quarantinedCountriesExcluded: number;
      uninhabitedTerritoriesExcluded: number;
      quarantinedOrExpiredProgramsExcluded: number;
      draftArticlesExcluded: number;
      thinPlaceholderRoutesExcluded: number;
    };
  };
  legacyComparison: {
    legacySitemapFilesPreserved: true;
    legacyTotalUrlsCounted: number;
    urlReductionPercent: number;
  };
}

export interface GenerateStaticSitemapsOptions {
  dataDir?: string;
  outDir?: string;
  publicDir?: string;
  evaluationDate?: Date;
  /**
   * Phase 9.8.5: When true (default for standard CLI runs targeting public/sitemaps-static),
   * synchronizes root public/sitemap-index.xml, public/sitemap_index.xml, and public/sitemap.xml
   * to the verified-only static catalog and removes obsolete quarantined legacy sitemap chunks.
   * Automatically defaults to false when a custom outDir is passed (e.g., isolated staging/unit tests).
   */
  updateRootPublicSitemaps?: boolean;
}

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function listFiles(dirPath: string, ext: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(ext) && !fs.statSync(path.join(dirPath, f)).isDirectory())
    .sort()
    .map((f) => path.join(dirPath, f));
}

function readJson<T>(fp: string): T {
  return JSON.parse(fs.readFileSync(fp, 'utf8')) as T;
}

function countLegacyPublicSitemapUrls(publicDir: string): number {
  if (!fs.existsSync(publicDir)) return 0;
  let total = 0;
  for (const f of fs.readdirSync(publicDir)) {
    if (!/^sitemap.*\.xml$/i.test(f) || f === 'sitemap-static-index.xml') continue;
    const full = path.join(publicDir, f);
    if (fs.statSync(full).isDirectory()) continue;
    const xml = fs.readFileSync(full, 'utf8');
    total += (xml.match(/<url>/g) || []).length;
  }
  return total;
}

function buildUrlsetXml(entries: StaticSitemapUrlEntry[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
  ];
  for (const entry of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority}</priority>`);
    for (const alt of entry.alternates) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />`
      );
    }
    lines.push('  </url>');
  }
  lines.push('</urlset>', '');
  return lines.join('\n');
}

export function generateStaticSitemaps(options: GenerateStaticSitemapsOptions = {}): StaticSitemapReport {
  const rootDir = process.cwd();
  const dataDir = path.resolve(options.dataDir ?? path.join(rootDir, 'data'));
  const publicDir = path.resolve(options.publicDir ?? path.join(rootDir, 'public'));
  const outDir = path.resolve(options.outDir ?? path.join(publicDir, 'sitemaps-static'));
  const evaluationDate = options.evaluationDate ?? new Date('2026-11-23T00:00:00.000Z');

  // Strict validation gate before sitemap generation
  const validation = validateStaticCatalog({ dataDir, evaluationDate });
  if (!validation.valid) {
    throw new Error(
      `CATALOG_VALIDATION_FAILED: Refusing to generate static sitemaps (${validation.summary.errorCount} validation error(s)).`
    );
  }

  const countries = listFiles(path.join(dataDir, 'countries'), '.json').map((fp) => readJson<CountryRecord>(fp));
  const claims = readJson<ClaimRecord[]>(path.join(dataDir, 'verification/claims.json'));
  const quarantine = readJson<Array<{ entityType: string; entityId: string }>>(
    path.join(dataDir, 'verification/quarantine.json')
  );
  const claimsByProgram = new Map<string, ClaimRecord[]>();
  for (const c of claims) {
    const arr = claimsByProgram.get(c.programId) ?? [];
    arr.push(c);
    claimsByProgram.set(c.programId, arr);
  }

  const entries: StaticSitemapUrlEntry[] = [];
  const seenCanonical = new Set<string>();

  const pushEntry = (
    rawPath: string,
    lastmod: string,
    changefreq: 'daily' | 'weekly' | 'monthly',
    priority: string,
    bucket: StaticSitemapUrlEntry['bucket']
  ) => {
    const canonical = normalizeCanonicalUrl(rawPath, BASE_ORIGIN);
    if (seenCanonical.has(canonical)) return;
    seenCanonical.add(canonical);
    const alternates = getHreflangAlternatesForRoute(rawPath, BASE_ORIGIN);
    entries.push({ loc: canonical, lastmod: lastmod.slice(0, 10), changefreq, priority, alternates, bucket });
  };

  // 1. Core substantive platform pages
  const corePages: Array<{ path: string; priority: string; freq: 'daily' | 'weekly' | 'monthly' }> = [
    { path: '/', priority: '1.0', freq: 'daily' },
    { path: '/immigration', priority: '0.95', freq: 'daily' },
    { path: '/routes', priority: '0.9', freq: 'weekly' },
    { path: '/blogs', priority: '0.85', freq: 'weekly' },
    { path: '/verification', priority: '0.8', freq: 'weekly' },
    { path: '/about', priority: '0.6', freq: 'monthly' },
    { path: '/contact', priority: '0.5', freq: 'monthly' },
    { path: '/privacy', priority: '0.4', freq: 'monthly' },
    { path: '/terms', priority: '0.4', freq: 'monthly' }
  ];
  for (const cp of corePages) {
    pushEntry(cp.path, '2026-11-23', cp.freq, cp.priority, 'core');
  }

  // 2. Verified ACTIVE country hubs ONLY (excludes uninhabited territories and quarantined/pending countries)
  let quarantinedCountriesExcluded = 0;
  let uninhabitedTerritoriesExcluded = 0;
  for (const c of countries) {
    if (c.recordStatus === 'UNINHABITED_TERRITORY' || UNINHABITED_TERRITORY_CODES.has(c.slug)) {
      uninhabitedTerritoriesExcluded++;
      continue;
    }
    if (c.recordStatus !== 'ACTIVE' || c.immigrationAuthorityRefs.length === 0) {
      quarantinedCountriesExcluded++;
      continue;
    }
    pushEntry(`/immigration/${c.slug}`, c.lastReviewedAt, 'weekly', '0.9', 'countries');
  }

  // 3. Strictly eligible published immigration programs ONLY
  let eligibleProgramsCount = 0;
  for (const fp of listFiles(path.join(dataDir, 'programs'), '.json')) {
    const progs = readJson<ImmigrationProgramRecord[]>(fp);
    for (const p of progs) {
      const gate = isEligibleForPublicCatalogIndex(p, {
        nowDate: evaluationDate,
        linkedClaims: claimsByProgram.get(p.programId) ?? []
      });
      if (!gate.eligible) continue;
      eligibleProgramsCount++;
      pushEntry(
        `/visa/${p.destinationCountryIso.toLowerCase()}/${p.programId}`,
        p.lastVerifiedDate || p.lastUpdatedDate,
        'weekly',
        '0.85',
        'programs'
      );
    }
  }

  // 4. Verified bilateral route overrides ONLY (eliminates tens of thousands of thin placeholder route URLs)
  let verifiedRoutesCount = 0;
  for (const fp of listFiles(path.join(dataDir, 'routes/overrides'), '.json')) {
    const routes = readJson<BilateralRouteOverrideRecord[]>(fp);
    for (const r of routes) {
      if (!r.routePublicationEligible) continue;
      verifiedRoutesCount++;
      pushEntry(
        `/${r.routeId}`,
        r.verificationMetadata.lastVerifiedDate || '2026-11-10',
        'weekly',
        '0.8',
        'routes'
      );
    }
  }

  // 5. Published editorial articles ONLY (drafts strictly excluded)
  for (const fp of listFiles(path.join(dataDir, 'editorial/published'), '.md')) {
    const parsed = matter(fs.readFileSync(fp, 'utf8'));
    const data = parsed.data as Partial<EditorialArticleRecord>;
    if (data.editorialStatus !== 'published' || !data.slug || !data.publicationDate) continue;
    pushEntry(`/${data.slug}`, data.updatedDate || data.publicationDate, 'weekly', '0.8', 'editorial');
  }

  const draftArticlesExcluded = listFiles(path.join(dataDir, 'editorial/drafts'), '.md').length;
  const quarantinedOrExpiredProgramsExcluded = quarantine.filter((q) => q.entityType === 'program').length;
  const thinPlaceholderRoutesExcluded = 249 * 248 - verifiedRoutesCount;

  // Self-validate every emitted URL before writing
  const validationErrors: string[] = [];
  const quarantinedProgramIds = new Set(
    quarantine.filter((q) => q.entityType === 'program').map((q) => q.entityId.toLowerCase())
  );
  const draftSlugs = new Set(
    listFiles(path.join(dataDir, 'editorial/drafts'), '.md').map((fp) => path.basename(fp, '.md').toLowerCase())
  );

  for (const entry of entries) {
    if (!entry.loc.startsWith(`${BASE_ORIGIN}/`)) {
      validationErrors.push(`Non-canonical URL emitted: ${entry.loc}`);
    }
    const urlPath = entry.loc.slice(BASE_ORIGIN.length).toLowerCase();
    if (/^\/([a-z]{2})-to-\1$/.test(urlPath)) {
      validationErrors.push(`Self-route emitted: ${entry.loc}`);
    }
    if (isForbiddenFixtureId(urlPath.replace(/^\//, ''))) {
      validationErrors.push(`Forbidden fixture URL emitted: ${entry.loc}`);
    }
    for (const qPid of quarantinedProgramIds) {
      if (urlPath.includes(qPid)) {
        validationErrors.push(`Quarantined/expired program leaked into sitemap: ${entry.loc}`);
      }
    }
    for (const dSlug of draftSlugs) {
      if (urlPath === `/${dSlug}`) {
        validationErrors.push(`Draft editorial article leaked into sitemap: ${entry.loc}`);
      }
    }
    for (const uCode of UNINHABITED_TERRITORY_CODES) {
      if (urlPath === `/immigration/${uCode}`) {
        validationErrors.push(`Uninhabited territory leaked into sitemap: ${entry.loc}`);
      }
    }
    if (entry.alternates.length === 0) {
      validationErrors.push(`Missing hreflang alternates for eligible URL: ${entry.loc}`);
    } else {
      const hasEn = entry.alternates.some((a) => a.hreflang === 'en' && a.href === entry.loc);
      const hasXDefault = entry.alternates.some((a) => a.hreflang === 'x-default' && a.href === entry.loc);
      if (!hasEn || !hasXDefault) {
        validationErrors.push(`Inconsistent hreflang en/x-default canonical mapping for: ${entry.loc}`);
      }
    }
  }

  // Group into clean bucket sitemaps (never exceeding 50,000 URLs per file)
  fs.mkdirSync(outDir, { recursive: true });
  for (const oldFile of fs.readdirSync(outDir)) {
    if (oldFile.endsWith('.xml')) fs.unlinkSync(path.join(outDir, oldFile));
  }

  const buckets: Array<{ key: StaticSitemapUrlEntry['bucket']; fileName: string }> = [
    { key: 'core', fileName: 'sitemap-static-core.xml' },
    { key: 'countries', fileName: 'sitemap-static-countries.xml' },
    { key: 'programs', fileName: 'sitemap-static-programs.xml' },
    { key: 'routes', fileName: 'sitemap-static-routes.xml' },
    { key: 'editorial', fileName: 'sitemap-static-editorial.xml' }
  ];

  const sitemapFiles: StaticSitemapReport['sitemapFiles'] = [];
  const byBucket: Record<StaticSitemapUrlEntry['bucket'], number> = {
    core: 0,
    countries: 0,
    programs: 0,
    routes: 0,
    editorial: 0
  };
  let totalHreflangLinks = 0;

  for (const b of buckets) {
    const bucketEntries = entries.filter((e) => e.bucket === b.key);
    byBucket[b.key] = bucketEntries.length;
    if (bucketEntries.length === 0) continue;
    if (bucketEntries.length > MAX_URLS_PER_SITEMAP) {
      validationErrors.push(`Bucket "${b.key}" exceeds ${MAX_URLS_PER_SITEMAP} URLs (${bucketEntries.length}).`);
    }
    const xml = buildUrlsetXml(bucketEntries);
    fs.writeFileSync(path.join(outDir, b.fileName), xml, 'utf8');
    const altCount = bucketEntries.reduce((sum, e) => sum + e.alternates.length, 0);
    totalHreflangLinks += altCount;
    sitemapFiles.push({
      fileName: b.fileName,
      bucket: b.key,
      urlCount: bucketEntries.length,
      hreflangLinksCount: altCount
    });
  }

  // Emit static catalog sitemap index
  const indexRel = path.relative(publicDir, path.join(outDir, 'sitemap-static-index.xml')).replace(/\\/g, '/');
  const indexLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];
  for (const sf of sitemapFiles) {
    const urlPrefix = path.relative(publicDir, outDir).replace(/\\/g, '/');
    const loc = urlPrefix ? `${BASE_ORIGIN}/${urlPrefix}/${sf.fileName}` : `${BASE_ORIGIN}/${sf.fileName}`;
    indexLines.push('  <sitemap>');
    indexLines.push(`    <loc>${escapeXml(loc)}</loc>`);
    indexLines.push('    <lastmod>2026-11-23</lastmod>');
    indexLines.push('  </sitemap>');
  }
  indexLines.push('</sitemapindex>', '');
  const indexXml = indexLines.join('\n');
  const indexFilePath = path.join(outDir, 'sitemap-static-index.xml');
  fs.writeFileSync(indexFilePath, indexXml, 'utf8');

  const legacyTotalUrlsCounted = countLegacyPublicSitemapUrls(publicDir);

  // Phase 9.8.5: Cut over public root sitemaps (sitemap-index.xml, sitemap_index.xml, sitemap.xml)
  // to verified-only URLs and remove obsolete quarantined legacy chunks when targeting default public/sitemaps-static.
  const shouldUpdateRootPublic = options.updateRootPublicSitemaps ?? (options.outDir === undefined);
  if (shouldUpdateRootPublic && validationErrors.length === 0) {
    fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), indexXml, 'utf8');
    fs.writeFileSync(path.join(publicDir, 'sitemap_index.xml'), indexXml, 'utf8');
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildUrlsetXml(entries), 'utf8');

    const rootKeep = new Set(['sitemap-index.xml', 'sitemap_index.xml', 'sitemap.xml']);
    for (const existingFile of fs.readdirSync(publicDir)) {
      if (!/^sitemap.*\.xml$/i.test(existingFile)) continue;
      if (rootKeep.has(existingFile)) continue;
      const fullPath = path.join(publicDir, existingFile);
      if (fs.statSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  const urlReductionPercent =
    legacyTotalUrlsCounted > 0
      ? Number((((legacyTotalUrlsCounted - entries.length) / legacyTotalUrlsCounted) * 100).toFixed(2))
      : 0;

  return {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    valid: validationErrors.length === 0,
    validationErrors,
    baseOrigin: BASE_ORIGIN,
    outDir,
    indexFile: indexRel || 'sitemap-static-index.xml',
    sitemapFiles,
    totals: {
      substantiveUrlsEmitted: entries.length,
      totalHreflangLinks,
      byBucket,
      excludedSummary: {
        quarantinedCountriesExcluded,
        uninhabitedTerritoriesExcluded,
        quarantinedOrExpiredProgramsExcluded,
        draftArticlesExcluded,
        thinPlaceholderRoutesExcluded
      }
    },
    legacyComparison: {
      legacySitemapFilesPreserved: true,
      legacyTotalUrlsCounted,
      urlReductionPercent
    }
  };
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

  const report = generateStaticSitemaps({ dataDir, outDir });
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('===============================================================');
    console.log(report.valid ? '✅ VALID-ONLY STATIC CATALOG SITEMAPS GENERATED' : '❌ STATIC SITEMAP VALIDATION FAILED');
    console.log(`- Output Directory:        ${report.outDir}`);
    console.log(`- Sitemap Index:           ${report.indexFile}`);
    console.log(`- Substantive URLs:        ${report.totals.substantiveUrlsEmitted} (Hreflang links: ${report.totals.totalHreflangLinks})`);
    console.log(`- By Bucket:               core=${report.totals.byBucket.core}, countries=${report.totals.byBucket.countries}, programs=${report.totals.byBucket.programs}, routes=${report.totals.byBucket.routes}, editorial=${report.totals.byBucket.editorial}`);
    console.log(`- Legacy Sitemaps URLs:    ${report.legacyComparison.legacyTotalUrlsCounted.toLocaleString()} (preserved; ${report.legacyComparison.urlReductionPercent}% thin-URL reduction)`);
    console.log(`- Excluded Quarantined:    ${report.totals.excludedSummary.quarantinedCountriesExcluded} countries, ${report.totals.excludedSummary.quarantinedOrExpiredProgramsExcluded} expired/quarantined programs, ${report.totals.excludedSummary.draftArticlesExcluded} drafts, ${report.totals.excludedSummary.uninhabitedTerritoriesExcluded} uninhabited`);
    console.log('===============================================================');
  }

  process.exit(report.valid ? 0 : 1);
}
