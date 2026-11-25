import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import renderHandler, {
  isVercelPreviewDeployment,
  PREVIEW_NOINDEX_DIRECTIVE,
} from '../api/render';
import {
  isPreviewHostname,
  STAGING_PREVIEW_ROBOTS_DIRECTIVE,
} from '../src/utils/seoMetadataManager';

const ROOT = process.cwd();

function createMockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body = '';
  return {
    headers,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
    setHeader(name: string, val: string) {
      headers[name.toLowerCase()] = String(val);
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    send(payload: string) {
      body = String(payload);
      return this;
    },
  };
}

test('1. isVercelPreviewDeployment strictly detects Preview/staging hosts and never marks production www.visaapply.org as preview', () => {
  assert.equal(isVercelPreviewDeployment({ headers: { host: 'visaapply-git-staging-abc.vercel.app' } }, {}), true);
  assert.equal(isVercelPreviewDeployment({ headers: { host: 'staging.visaapply.org' } }, {}), true);
  assert.equal(isVercelPreviewDeployment({ headers: { host: 'www.visaapply.org' } }, { VERCEL_ENV: 'preview' }), true);

  // Production & localhost must NEVER be classified as preview
  assert.equal(isVercelPreviewDeployment({ headers: { host: 'www.visaapply.org' } }, { VERCEL_ENV: 'production' }), false);
  assert.equal(isVercelPreviewDeployment({ headers: { host: 'visaapply.org' } }, { VERCEL_ENV: 'production' }), false);
  assert.equal(isVercelPreviewDeployment({ headers: { host: '127.0.0.1:3000' } }, {}), false);
});

test('2. api/render.ts emits X-Robots-Tag and HTML meta noindex on Vercel Preview while preserving production indexability and canonical URL', () => {
  const prevVercelEnv = process.env.VERCEL_ENV;
  try {
    // Preview mode: must emit noindex, nofollow, noarchive + private no-store + production canonical
    process.env.VERCEL_ENV = 'preview';
    const previewRes = createMockRes();
    renderHandler(
      { url: '/immigration', query: { path: '/immigration' }, headers: { host: 'visaapply-git-staging.vercel.app' } },
      previewRes
    );
    assert.equal(previewRes.statusCode, 200);
    assert.equal(previewRes.headers['x-robots-tag'], PREVIEW_NOINDEX_DIRECTIVE);
    assert.ok(previewRes.headers['cache-control'].includes('no-store'));
    assert.ok(previewRes.body.includes(`<meta name="robots" content="${PREVIEW_NOINDEX_DIRECTIVE}"`));
    assert.ok(previewRes.body.includes(`<meta name="googlebot" content="${PREVIEW_NOINDEX_DIRECTIVE}"`));
    assert.ok(previewRes.body.includes('https://www.visaapply.org/immigration'));

    // Production mode: must remain indexable with canonical Link header
    process.env.VERCEL_ENV = 'production';
    const prodRes = createMockRes();
    renderHandler(
      { url: '/immigration', query: { path: '/immigration' }, headers: { host: 'www.visaapply.org' } },
      prodRes
    );
    assert.equal(prodRes.statusCode, 200);
    assert.ok(prodRes.headers['x-robots-tag'].includes('index, follow'));
    assert.equal(prodRes.headers['x-robots-tag'].includes('noindex'), false);
    assert.ok(prodRes.headers['link']?.includes('https://www.visaapply.org/immigration'));
    assert.ok(prodRes.body.includes('<meta name="robots" content="index, follow'));
  } finally {
    if (prevVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prevVercelEnv;
  }
});

test('3. Client-side seoMetadataManager isPreviewHostname protects *.vercel.app and staging hosts without touching production', () => {
  assert.equal(STAGING_PREVIEW_ROBOTS_DIRECTIVE, 'noindex, nofollow, noarchive');
  assert.equal(isPreviewHostname('visaapply-git-staging-demo.vercel.app'), true);
  assert.equal(isPreviewHostname('staging.visaapply.org'), true);
  assert.equal(isPreviewHostname('preview.visaapply.org'), true);
  assert.equal(isPreviewHostname('www.visaapply.org'), false);
  assert.equal(isPreviewHostname('visaapply.org'), false);
  assert.equal(isPreviewHostname('localhost'), false);
});

test('4. vercel.json preserves existing production configuration, adds static catalog headers, and never sets global noindex', () => {
  const raw = fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8');
  const parsed = JSON.parse(raw);

  assert.ok(Array.isArray(parsed.crons) && parsed.crons.length >= 1, 'Existing cron preserved');
  assert.ok(parsed.functions?.['api/render.ts']?.includeFiles === 'dist/index.html', 'api/render.ts function config preserved');
  assert.ok(parsed.redirects.some((r: any) => r.destination === 'https://www.visaapply.org/:path*'), 'Apex-to-www redirect preserved');
  assert.ok(parsed.headers.some((h: any) => h.source === '/catalog/(.*)'), 'Static catalog cache headers added');
  assert.ok(parsed.headers.some((h: any) => h.source === '/sitemaps-static/(.*)'), 'Candidate sitemap headers added');
  assert.ok(parsed.rewrites.some((r: any) => r.destination === '/api/render?path=/$1'), 'SPA SSR catch-all rewrite preserved');

  // Ensure vercel.json never applies global noindex to production
  assert.equal(/noindex/i.test(raw), false, 'vercel.json must not hardcode global noindex');
});

test('5. Production and candidate sitemaps contain zero staging/preview URLs, and VERCEL_PREVIEW_STAGING_GUIDE.md is complete with zero secrets', () => {
  const publicDir = path.join(ROOT, 'public');
  const sitemapFiles = [
    ...fs.readdirSync(publicDir).filter((f) => /^sitemap.*\.xml$/i.test(f)).map((f) => path.join(publicDir, f)),
    ...fs.readdirSync(path.join(publicDir, 'sitemaps-static')).filter((f) => f.endsWith('.xml')).map((f) => path.join(publicDir, 'sitemaps-static', f)),
  ];

  assert.equal(sitemapFiles.length, 89 + 6, 'All 89 legacy + 6 candidate sitemap XML files must exist');
  for (const f of sitemapFiles) {
    const xml = fs.readFileSync(f, 'utf8');
    assert.equal(/\.vercel\.app/i.test(xml), false, `Sitemap ${f} must not contain vercel.app URLs`);
    assert.equal(/staging\.visaapply\.org/i.test(xml), false, `Sitemap ${f} must not contain staging URLs`);
  }

  const guide = fs.readFileSync(path.join(ROOT, 'docs/VERCEL_PREVIEW_STAGING_GUIDE.md'), 'utf8');
  for (const required of [
    'GitHub Branch Strategy',
    'Vercel Git Integration',
    'Production Branch',
    'Preview Deployment',
    'Environment Variable Isolation',
    'Staging-Only',
    'Vercel Plan & Commercial-Use Restrictions',
    'Rollback Procedure',
    'test:e2e:preview',
  ]) {
    assert.ok(guide.includes(required), `VERCEL_PREVIEW_STAGING_GUIDE.md missing: ${required}`);
  }
  assert.equal(/(AIza[0-9A-Za-z_-]{35}|\bre_[A-Za-z0-9_]{20,}|BEGIN PRIVATE KEY|postgres:\/\/[^<\s]+)/.test(guide), false);
});
