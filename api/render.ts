import fs from 'fs';
import path from 'path';
import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer';

const FALLBACK_HTML_TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VisaApply.org – Global Visa Requirements, PR Pathways &amp; Official Links (249 Countries)</title>
    <meta name="title" content="VisaApply.org – Global Visa Requirements, PR Pathways &amp; Official Links (249 Countries)" />
    <meta name="description" content="Check bilateral visa requirements for any passport to 249 countries and territories." />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <link rel="canonical" href="https://www.visaapply.org/" />
    <link rel="alternate" hreflang="en" href="https://www.visaapply.org/" />
    <link rel="alternate" hreflang="en-IN" href="https://www.visaapply.org/" />
    <link rel="alternate" hreflang="x-default" href="https://www.visaapply.org/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="VisaApply.org" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:url" content="https://www.visaapply.org/" />
    <meta property="og:title" content="VisaApply.org" />
    <meta property="og:description" content="Check bilateral visa requirements for any passport to 249 countries and territories." />
    <meta property="og:image" content="https://www.visaapply.org/og/default.jpg" />
    <meta property="og:image:secure_url" content="https://www.visaapply.org/og/default.jpg" />
    <meta property="og:image:alt" content="VisaApply.org" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@VisaApplyOrg" />
    <meta name="twitter:url" content="https://www.visaapply.org/" />
    <meta name="twitter:title" content="VisaApply.org" />
    <meta name="twitter:description" content="Check bilateral visa requirements for any passport to 249 countries and territories." />
    <meta name="twitter:image" content="https://www.visaapply.org/og/default.jpg" />
    <meta name="twitter:image:alt" content="VisaApply.org" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

function loadBaseHtmlTemplate(): string {
  const candidates = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, 'utf-8');
      }
    } catch {
      // Continue to next candidate
    }
  }
  return FALLBACK_HTML_TEMPLATE;
}

export default function handler(req: any, res: any) {
  try {
    const queryPath = typeof req.query?.path === 'string' ? req.query.path : '';
    const rawUrl = queryPath
      ? queryPath.startsWith('/')
        ? queryPath
        : `/${queryPath}`
      : String(req.url || '/').split('?')[0] || '/';

    const payload = renderRouteSsrPayload(rawUrl);

    if (payload.statusCode === 301 && payload.redirectLocation) {
      res.setHeader('Location', payload.redirectLocation);
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      return res.status(301).send(payload.ssrBodyHtml);
    }

    const baseHtml = loadBaseHtmlTemplate();
    const fullHtml = injectSsrPayloadIntoHtml(baseHtml, payload);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', payload.robots);
    res.setHeader('Link', `<${payload.canonicalUrl}>; rel="canonical"`);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(fullHtml);
  } catch (err: any) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(FALLBACK_HTML_TEMPLATE);
  }
}
