import fs from 'fs';
import path from 'path';
import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer.js';
import { extractAdminTokenFromRequest, verifyAdminToken } from '../src/utils/authSecurity.js';
import { applySecurityHeaders } from '../src/utils/securityHardening.js';

const FALLBACK_HTML_TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VisaApply.org – Global Visa Guides, Immigration Pathways &amp; Official Links (249 Countries)</title>
    <meta name="title" content="VisaApply.org – Global Visa Guides, Immigration Pathways &amp; Official Links (249 Countries)" />
    <meta name="description" content="Independent global visa and immigration guide across 249 ISO countries and territories, 61,752 bilateral corridors, and 15 interface languages." />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <link rel="canonical" href="https://www.visaapply.org/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="VisaApply.org" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:url" content="https://www.visaapply.org/" />
    <meta property="og:title" content="VisaApply.org" />
    <meta property="og:description" content="Independent global visa and immigration guide across 249 ISO countries and territories." />
    <meta property="og:image" content="https://www.visaapply.org/og-image.jpg" />
    <meta property="og:image:secure_url" content="https://www.visaapply.org/og-image.jpg" />
    <meta property="og:image:alt" content="VisaApply.org" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@VisaApplyOrg" />
    <meta name="twitter:url" content="https://www.visaapply.org/" />
    <meta name="twitter:title" content="VisaApply.org" />
    <meta name="twitter:description" content="Independent global visa and immigration guide across 249 ISO countries and territories." />
    <meta name="twitter:image" content="https://www.visaapply.org/og-image.jpg" />
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

export const PREVIEW_NOINDEX_DIRECTIVE = 'noindex, nofollow, noarchive';

/**
 * Detects Vercel Preview / staging deployments so preview URLs are never indexed
 * as duplicate production pages while production (www.visaapply.org) remains indexable.
 */
export function isVercelPreviewDeployment(
  req?: { headers?: Record<string, any> },
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const vercelEnv = String(env.VERCEL_ENV || '').trim().toLowerCase();
  if (vercelEnv === 'preview') {
    return true;
  }

  const rawHost = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .split(':')[0];

  if (!rawHost) return false;
  if (rawHost === 'www.visaapply.org' || rawHost === 'visaapply.org') {
    return false;
  }
  if (rawHost.endsWith('.vercel.app')) {
    return true;
  }
  if (/^(?:staging|preview|visaapply-staging)\./i.test(rawHost) && rawHost.endsWith('.visaapply.org')) {
    return true;
  }
  return false;
}

export default function handler(req: any, res: any) {
  applySecurityHeaders(res, { isApi: false });
  const isPreview = isVercelPreviewDeployment(req);
  try {
    const queryPath = typeof req.query?.path === 'string' ? req.query.path : '';
    const rawUrl = queryPath
      ? queryPath.startsWith('/')
        ? queryPath
        : `/${queryPath}`
      : String(req.url || '/').split('?')[0] || '/';

    const cleanReqPath = (rawUrl || '/').replace(/^\/(en|hi|ar|fr|de|es|pl|ru|zh|ja|pt|it|nl|tr|ko)(\/|$)/i, '/') || '/';
    const isAdminPageReq = cleanReqPath === '/admin' || cleanReqPath.startsWith('/admin/');
    const isAdminLoginReq = cleanReqPath === '/admin/login' || cleanReqPath.startsWith('/admin/login/');
    const isAuditPageReq = cleanReqPath === '/audit' || cleanReqPath === '/audit/';
    const isProtectedAdminOrAudit = (isAdminPageReq && !isAdminLoginReq) || isAuditPageReq;

    if (isProtectedAdminOrAudit) {
      const token = extractAdminTokenFromRequest(req);
      if (!verifyAdminToken(token)) {
        res.setHeader('Location', `/admin/login?redirect=${encodeURIComponent(cleanReqPath)}`);
        res.setHeader('X-Robots-Tag', PREVIEW_NOINDEX_DIRECTIVE);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        return res.status(302).send('');
      }
    }

    const payload = renderRouteSsrPayload(rawUrl);

    if (payload.statusCode === 301 && payload.redirectLocation) {
      res.setHeader('Location', payload.redirectLocation);
      res.setHeader('X-Robots-Tag', isPreview ? PREVIEW_NOINDEX_DIRECTIVE : 'noindex, follow');
      res.setHeader(
        'Cache-Control',
        isPreview ? 'private, no-store, max-age=0' : 'public, max-age=86400, s-maxage=86400'
      );
      return res.status(301).send(payload.ssrBodyHtml);
    }

    const effectivePayload = isPreview
      ? { ...payload, robots: PREVIEW_NOINDEX_DIRECTIVE }
      : (isAdminPageReq || isAuditPageReq)
        ? { ...payload, robots: PREVIEW_NOINDEX_DIRECTIVE }
        : payload;

    const baseHtml = loadBaseHtmlTemplate();
    const fullHtml = injectSsrPayloadIntoHtml(baseHtml, effectivePayload);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', effectivePayload.robots);
    if (isAdminPageReq || isAuditPageReq || isPreview) {
      res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
    } else {
      res.setHeader('Link', `<${effectivePayload.canonicalUrl}>; rel="canonical"`);
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    }
    return res.status(200).send(fullHtml);
  } catch (err: any) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (isPreview) {
      res.setHeader('X-Robots-Tag', PREVIEW_NOINDEX_DIRECTIVE);
      res.setHeader('Cache-Control', 'private, no-store, max-age=0');
      const previewFallbackHtml = FALLBACK_HTML_TEMPLATE.replace(
        /<meta name="(robots|googlebot|bingbot)" content="[^"]*" \/>/gi,
        `<meta name="$1" content="${PREVIEW_NOINDEX_DIRECTIVE}" />`
      );
      return res.status(200).send(previewFallbackHtml);
    }
    return res.status(200).send(FALLBACK_HTML_TEMPLATE);
  }
}
