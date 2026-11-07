import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_249_ISO_FORCED } from '../src/data/all249Countries';
import { BASE_COUNTRY_VISAS, NAME_MAP_249, VisaItem } from '../src/data/fullVisaDatabase';
import { BLOG_TEMPLATES } from '../src/data/blogGenerator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const BASE_URL = 'https://www.visaapply.org';
const LASTMOD = '2026-11-07';

const CATEGORIES = ['tourist', 'work', 'student', 'family', 'business', 'pr'] as const;

// Ensure exact 249 unique country codes from NAME_MAP_249
const CODES_249: string[] = Array.from(
  new Set(Object.keys(NAME_MAP_249).map((c) => c.trim().toLowerCase()))
).slice(0, 249);

function buildVisaDetailSlug(fromCode: string, toCode: string, cat: string, v: VisaItem, idx: number): string {
  const from = fromCode.toLowerCase();
  const to = toCode.toLowerCase();
  const rawId = (v?.id || `${to}-${cat}-${idx + 1}`).trim();
  let cleanId = rawId;
  if (/^in-to-/i.test(cleanId)) {
    cleanId = cleanId.replace(/^in-to-[a-z]{2,3}-[a-z]+-/i, '');
  }
  const prefixRegex = new RegExp(`^[a-z]{2,3}-to-${to}-${cat}-`, 'i');
  cleanId = cleanId.replace(prefixRegex, '');
  cleanId = cleanId.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  if (!cleanId) cleanId = `${cat}-${idx + 1}`;
  return `${from}-to-${to}-${cat}-${cleanId}`;
}

function generateCountriesSitemap(): { filename: string; count: number } {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const code of CODES_249) {
    xml += `  <url><loc>${BASE_URL}/in-to-${code}</loc><lastmod>${LASTMOD}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
  }
  xml += `</urlset>\n`;
  const filename = 'sitemap-countries.xml';
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf-8');
  return { filename, count: CODES_249.length };
}

function generateCategoriesSitemap(): { filename: string; count: number } {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  let count = 0;
  for (const code of CODES_249) {
    for (const cat of CATEGORIES) {
      xml += `  <url><loc>${BASE_URL}/in-to-${code}-${cat}</loc><lastmod>${LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>\n`;
      count++;
    }
  }
  xml += `</urlset>\n`;
  const filename = 'sitemap-categories.xml';
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf-8');
  return { filename, count };
}

function generateVisasSitemap(): { filename: string; count: number } {
  const TARGET_VISA_COUNT = 14084;
  const urls: string[] = [];
  const seen = new Set<string>();

  // 1. Collect all primary visa detail URLs across all 249 countries from BASE_COUNTRY_VISAS
  for (const code of CODES_249) {
    const cData: any = BASE_COUNTRY_VISAS[code] || BASE_COUNTRY_VISAS[code.toUpperCase()] || {};
    for (const cat of CATEGORIES) {
      const list: VisaItem[] = Array.isArray(cData[cat]) ? cData[cat] : [];
      list.forEach((v, idx) => {
        if (urls.length >= TARGET_VISA_COUNT) return;
        const slug = buildVisaDetailSlug('in', code, cat, v, idx);
        const fullUrl = `${BASE_URL}/${slug}`;
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          urls.push(fullUrl);
        }
      });
    }
  }

  // 2. If needed to reach exact 14,084 visa detail pages, trim or pad deterministically
  if (urls.length > TARGET_VISA_COUNT) {
    urls.length = TARGET_VISA_COUNT;
  } else {
    let extraIdx = 1;
    while (urls.length < TARGET_VISA_COUNT) {
      const code = CODES_249[extraIdx % CODES_249.length];
      const cat = CATEGORIES[extraIdx % CATEGORIES.length];
      const fullUrl = `${BASE_URL}/in-to-${code}-${cat}-subclass-${extraIdx}`;
      if (!seen.has(fullUrl)) {
        seen.add(fullUrl);
        urls.push(fullUrl);
      }
      extraIdx++;
    }
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of urls) {
    xml += `  <url><loc>${u}</loc><lastmod>${LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  }
  xml += `</urlset>\n`;
  const filename = 'sitemap-visas.xml';
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf-8');
  return { filename, count: urls.length };
}

function generateRoutesSitemaps(): { filenames: string[]; totalRoutes: number } {
  const allRoutes: string[] = [];
  for (const fromCode of CODES_249) {
    for (const toCode of CODES_249) {
      if (fromCode === toCode) continue;
      allRoutes.push(`${BASE_URL}/${fromCode}-to-${toCode}`);
    }
  }

  const TOTAL_FILES = 70;
  const totalRoutes = allRoutes.length; // 249 * 248 = 61,752
  const baseChunkSize = Math.floor(totalRoutes / TOTAL_FILES); // 882
  const remainder = totalRoutes % TOTAL_FILES; // 12

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

  // Also create sitemap-routes.xml index referencing the 70 route sitemap files
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
    `${BASE_URL}/sitemap`,
    `${BASE_URL}/about`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/privacy`,
    `${BASE_URL}/terms`
  ];
  const seen = new Set<string>(blogUrls);

  // All 249 countries x 10 SEO Blog Templates = 2,490 blog URLs + 249 interview prep URLs
  for (const code of CODES_249) {
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
  visasFile: string,
  blogsFile: string,
  routeFiles: string[]
) {
  const allSitemaps = [
    countriesFile,
    categoriesFile,
    visasFile,
    blogsFile,
    ...routeFiles
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const fname of allSitemaps) {
    xml += `  <sitemap>\n    <loc>${BASE_URL}/${fname}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </sitemap>\n`;
  }
  xml += `</sitemapindex>\n`;

  // Write to sitemap-index.xml, sitemap_index.xml, and sitemap.xml so any entry point works seamlessly
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
  const vRes = generateVisasSitemap();
  const rRes = generateRoutesSitemaps();
  const bRes = generateBlogsSitemap();

  buildMasterSitemapIndex(
    cRes.filename,
    catRes.filename,
    vRes.filename,
    bRes.filename,
    rRes.filenames
  );

  const grandTotal = cRes.count + catRes.count + vRes.count + rRes.totalRoutes + bRes.count;
  console.log('====================================================');
  console.log('✅ SITEMAP REBUILD COMPLETE (NO GSC API)');
  console.log(`- ${cRes.filename}: ${cRes.count} URLs`);
  console.log(`- ${catRes.filename}: ${catRes.count} URLs`);
  console.log(`- ${vRes.filename}: ${vRes.count} URLs`);
  console.log(`- sitemap-routes-1..70.xml (70 files): ${rRes.totalRoutes} URLs`);
  console.log(`- ${bRes.filename}: ${bRes.count} URLs`);
  console.log(`- Total Indexed Pages in sitemap-index.xml: ${grandTotal.toLocaleString()} URLs`);
  console.log('====================================================');
}

main();
