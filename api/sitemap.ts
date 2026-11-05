import fs from 'fs';
import path from 'path';

export default function handler(req: any, res: any) {
  try {
    const isIndex = (req.url || '').includes('index');
    const targetFileName = isIndex ? 'sitemap_index.xml' : 'sitemap.xml';

    const candidatePaths = [
      path.join(process.cwd(), 'public', targetFileName),
      path.join(process.cwd(), 'dist', targetFileName),
      path.join(__dirname, '..', 'public', targetFileName),
      path.join(__dirname, '..', 'dist', targetFileName),
      path.join(process.cwd(), targetFileName)
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const xml = fs.readFileSync(p, 'utf-8');
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
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
  <url>
    <loc>${baseUrl}/audit</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(fallbackXml);
  } catch (err: any) {
    res.status(500).send('Error generating sitemap');
  }
}
