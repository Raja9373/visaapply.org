import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_249_ISO_FORCED } from '../src/data/all249Countries';
import { BASE_COUNTRY_VISAS, NAME_MAP_249, VisaItem } from '../src/data/fullVisaDatabase';
import { BLOG_TEMPLATES } from '../src/data/blogGenerator';
import { UNINHABITED_TERRITORY_CODES } from '../src/utils/ssrRouteRenderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const BASE_URL = 'https://www.visaapply.org';
const LASTMOD = '2026-11-14';

const CATEGORIES = ['tourist', 'work', 'student', 'family', 'business', 'pr'] as const;

// Canonical 249 ISO 3166-1 alpha-2 registry, filtered to exclude uninhabited territories from public sitemaps
const ALL_249_CODES: string[] = Array.from(
  new Set(ALL_249_ISO_FORCED.map((c) => c.code.trim().toLowerCase()))
);

const INDEXABLE_COUNTRY_CODES: string[] = ALL_249_CODES.filter(
  (code) => !UNINHABITED_TERRITORY_CODES.has(code)
);

function isPubliclyIndexableVisaItem(v: VisaItem | any): boolean {
  if (!v || typeof v !== 'object') return false;
  if (v.isQuarantined === true || v.quarantinedSynthetic === true || v.publicEligible === false) {
    return false;
  }
  const idStr = String(v.id || '').trim().toLowerCase();
  if (idStr.startsWith('p1-audit-')) return false;
  return true;
}

function buildVisaDetailSlug(fromCode: string, toCode: string, cat: string, v: VisaItem, idx: number): string {
  const to = toCode.toLowerCase();
  const from = fromCode.toLowerCase() === to ? (to === 'in' ? 'us' : 'in') : fromCode.toLowerCase();
  const rawId = (v?.id || `${to}-${cat}-${idx + 1}`).trim();
  let cleanId = rawId;
  if (/^in-to-/i.test(cleanId)) {
    cleanId = cleanId.replace(/^in-to-[a-z]{2,3}-[a-z]+-/i, '');
  }
  const prefixRegex = new RegExp(`^[a-z]{2,3}-to-${to}-${cat}-`, 'i');
  cleanId = cleanId.replace(prefixRegex, '');
  cleanId = cleanId.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  if (!cleanId) cleanId = `${cat}-${idx + 1}`;
  return `${from}-to-${to}-${cat}-${cleanId}`.toLowerCase();
}

function generateCountriesSitemap(): { filename: string; count: number } {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const code of INDEXABLE_COUNTRY_CODES) {
    const locUrl = code === 'in' ? `${BASE_URL}/immigration/in` : `${BASE_URL}/in-to-${code}`;
    xml += `  <url><loc>${locUrl}</loc><lastmod>${LASTMOD}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
  }
  xml += `</urlset>\n`;
  const filename = 'sitemap-countries.xml';
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf-8');
  return { filename, count: INDEXABLE_COUNTRY_CODES.length };
}

function generateCategoriesSitemap(): { filename: string; count: number } {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  let count = 0;
  for (const code of INDEXABLE_COUNTRY_CODES) {
    const originPrefix = code === 'in' ? 'us' : 'in';
    for (const cat of CATEGORIES) {
      xml += `  <url><loc>${BASE_URL}/${originPrefix}-to-${code}-${cat}</loc><lastmod>${LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>\n`;
      count++;
    }
  }
  xml += `</urlset>\n`;
  const filename = 'sitemap-categories.xml';
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf-8');
  return { filename, count };
}

function generateVisasSitemaps(): { filenames: string[]; count: number } {
  const urls: string[] = [];
  const seen = new Set<string>();

  // Collect genuine, non-quarantined visa detail URLs directly from BASE_COUNTRY_VISAS (no synthetic URL padding)
  const origin = 'in';
  for (const code of INDEXABLE_COUNTRY_CODES) {
    const effectiveOrigin = origin === code ? 'us' : origin;
    const cData: any = BASE_COUNTRY_VISAS[code] || BASE_COUNTRY_VISAS[code.toUpperCase()] || {};
    for (const cat of CATEGORIES) {
      const list: VisaItem[] = Array.isArray(cData[cat]) ? cData[cat] : [];
      list.forEach((v, idx) => {
        if (!isPubliclyIndexableVisaItem(v)) return;
        const slug = buildVisaDetailSlug(effectiveOrigin, code, cat, v, idx);
        const fullUrl = `${BASE_URL}/${slug}`;
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          urls.push(fullUrl);
        }
      });
    }
  }

  // Clean up any stale prior sitemap-visas-*.xml files before writing accurate chunks
  for (const file of fs.readdirSync(PUBLIC_DIR)) {
    if (/^sitemap-visas(?:-\d+)?\.xml$/i.test(file)) {
      fs.unlinkSync(path.join(PUBLIC_DIR, file));
    }
  }

  const CHUNK_SIZE = 1000;
  const totalFiles = Math.max(1, Math.ceil(urls.length / CHUNK_SIZE));
  const filenames: string[] = [];

  for (let i = 1; i <= totalFiles; i++) {
    const startIdx = (i - 1) * CHUNK_SIZE;
    const slice = urls.slice(startIdx, startIdx + CHUNK_SIZE);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const u of slice) {
      xml += `  <url><loc>${u}</loc><lastmod>${LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }
    xml += `</urlset>\n`;
    const filename = `sitemap-visas-${i}.xml`;
    fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf-8');
    filenames.push(filename);
  }

  return { filenames, count: urls.length };
}

function generateRoutesSitemaps(): { filenames: string[]; totalRoutes: number } {
  const allRoutes: string[] = [];
  for (const fromCode of INDEXABLE_COUNTRY_CODES) {
    for (const toCode of INDEXABLE_COUNTRY_CODES) {
      if (fromCode === toCode) continue;
      allRoutes.push(`${BASE_URL}/${fromCode}-to-${toCode}`);
    }
  }

  const TOTAL_FILES = 70;
  const totalRoutes = allRoutes.length;
  const baseChunkSize = Math.floor(totalRoutes / TOTAL_FILES);
  const remainder = totalRoutes % TOTAL_FILES;

  const filenames: string[] = [];
  let offset = 0;

  for (let i = 1; i <= TOTAL_FILES; i++) {
    const chunkSize = baseChunkSize + (i <= remainder ? 1 : 0);
    const slice = allRoutes.slice(offset, offset + chunkSize);
    offset += chunkSize;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const routeUrl of slice) {
      xml += `  <url><loc>${routeUrl}</loc><lastmod>${LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>\n`;
    }
    xml += `</urlset>\n`;

    const fname = `sitemap-routes-${i}.xml`;
    fs.writeFileSync(path.join(PUBLIC_DIR, fname), xml, 'utf-8');
    filenames.push(fname);
  }

  let routesIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const fname of filenames) {
    routesIndexXml += `  <sitemap>\n    <loc>${BASE_URL}/${fname}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </sitemap>\n`;
  }
  routesIndexXml += `</sitemapindex>\n`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-routes.xml'), routesIndexXml, 'utf-8');

  return { filenames, totalRoutes };
}

function generateBlogsSitemap(): { filename: string; count: number } {
  const blogUrls: string[] = [
    `${BASE_URL}/`,
    `${BASE_URL}/blogs`,
    `${BASE_URL}/routes`,
    `${BASE_URL}/flights`,
    `${BASE_URL}/immigration`,
    `${BASE_URL}/sitemap`,
    `${BASE_URL}/verification`,
    `${BASE_URL}/about`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/privacy`,
    `${BASE_URL}/terms`
  ];
  const seen = new Set<string>(blogUrls);

  for (const code of INDEXABLE_COUNTRY_CODES) {
    const countryName = NAME_MAP_249[code] || code.toUpperCase();
    const countrySlug = countryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    for (const tpl of BLOG_TEMPLATES) {
      const slug = `${countrySlug}-${tpl.slugSuffix}`;
      const u = `${BASE_URL}/${slug}`;
      if (!seen.has(u)) {
        seen.add(u);
        blogUrls.push(u);
      }
    }

    const interviewUrl = `${BASE_URL}/interview-prep/${code}`;
    if (!seen.has(interviewUrl)) {
      seen.add(interviewUrl);
      blogUrls.push(interviewUrl);
    }
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of blogUrls) {
    xml += `  <url><loc>${u}</loc><lastmod>${LASTMOD}</lastmod><changefreq>daily</changefreq><priority>0.85</priority></url>\n`;
  }
  xml += `</urlset>\n`;
  const filename = 'sitemap-blogs.xml';
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf-8');
  return { filename, count: blogUrls.length };
}

function buildMasterSitemapIndex(
  countriesFile: string,
  categoriesFile: string,
  visaFiles: string[],
  blogsFile: string,
  routeFiles: string[]
) {
  const allSitemaps = [
    countriesFile,
    categoriesFile,
    ...visaFiles,
    blogsFile,
    ...routeFiles
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const fname of allSitemaps) {
    xml += `  <sitemap>\n    <loc>${BASE_URL}/${fname}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </sitemap>\n`;
  }
  xml += `</sitemapindex>\n`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-index.xml'), xml, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap_index.xml'), xml, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8');
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const cRes = generateCountriesSitemap();
  const catRes = generateCategoriesSitemap();
  const vRes = generateVisasSitemaps();
  const rRes = generateRoutesSitemaps();
  const bRes = generateBlogsSitemap();

  buildMasterSitemapIndex(
    cRes.filename,
    catRes.filename,
    vRes.filenames,
    bRes.filename,
    rRes.filenames
  );

  const grandTotal = cRes.count + catRes.count + vRes.count + rRes.totalRoutes + bRes.count;
  console.log('====================================================');
  console.log('✅ CLEAN SITEMAP REBUILD COMPLETE (NO SYNTHETIC PADDING)');
  console.log(`- Indexable countries (excluding uninhabited territories): ${INDEXABLE_COUNTRY_CODES.length}`);
  console.log(`- ${cRes.filename}: ${cRes.count} URLs`);
  console.log(`- ${catRes.filename}: ${catRes.count} URLs`);
  console.log(`- ${vRes.filenames.length} visa sitemap file(s): ${vRes.count} genuine URLs`);
  console.log(`- sitemap-routes-1..70.xml (70 files): ${rRes.totalRoutes} URLs`);
  console.log(`- ${bRes.filename}: ${bRes.count} URLs`);
  console.log(`- Total Indexed Pages in sitemap-index.xml: ${grandTotal.toLocaleString()} URLs`);
  console.log('====================================================');
}

main();
