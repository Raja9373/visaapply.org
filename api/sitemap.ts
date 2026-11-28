import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default function handler(req: any, res: any) {
  try {
    const reqUrl = String(req?.url || '').toLowerCase();
    const isIndex = reqUrl.includes('index');
    const targetFileName = isIndex ? 'sitemap-index.xml' : 'sitemap.xml';
    const altIndexFileName = isIndex ? 'sitemap_index.xml' : targetFileName;

    const candidatePaths = [
      path.join(process.cwd(), 'public', targetFileName),
      path.join(process.cwd(), 'dist', targetFileName),
      path.join(currentDir, '..', 'public', targetFileName),
      path.join(currentDir, '..', 'dist', targetFileName),
      path.join(process.cwd(), targetFileName),
      ...(altIndexFileName !== targetFileName
        ? [
            path.join(process.cwd(), 'public', altIndexFileName),
            path.join(process.cwd(), 'dist', altIndexFileName),
            path.join(currentDir, '..', 'public', altIndexFileName),
            path.join(currentDir, '..', 'dist', altIndexFileName),
          ]
        : []),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const xml = fs.readFileSync(p, 'utf-8');
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex, follow');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        return res.status(200).send(xml);
      }
    }

    const baseUrl = 'https://www.visaapply.org';
    if (isIndex) {
      const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      return res.status(200).send(indexXml);
    }

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/sitemap</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, follow');
    return res.status(200).send(fallbackXml);
  } catch (err: any) {
    res.status(500).send('Error generating sitemap');
  }
}
