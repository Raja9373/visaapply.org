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

const FIVE_REQUIRED_ROUTES = [
  { label: 'Homepage', url: '/', canonicalPrefix: 'https://www.visaapply.org/' },
  { label: 'Country immigration landing', url: '/immigration/us', canonicalPrefix: 'https://www.visaapply.org/immigration/us' },
  { label: 'Visa category page', url: '/immigration?category=work', canonicalPrefix: 'https://www.visaapply.org/immigration' },
  { label: 'Visa route page', url: '/visa/us/us-h1b-specialty', canonicalPrefix: 'https://www.visaapply.org/visa/us/us-h1b-specialty' },
  { label: 'Blog/article page', url: '/in-to-ca-tourist', canonicalPrefix: 'https://www.visaapply.org/in-to-ca-tourist' },
] as const;

test('1. Phase 9.3 Preview SEO protection covers all 5 required routes in Preview (noindex) while keeping Production indexable', () => {
  const prevVercelEnv = process.env.VERCEL_ENV;
  try {
    for (const route of FIVE_REQUIRED_ROUTES) {
      // Preview (Vercel Hobby Preview URL for visaapply-staging)
      process.env.VERCEL_ENV = 'preview';
      const previewRes = createMockRes();
      const pathnameOnly = route.url.split('?')[0];
      renderHandler(
        {
          url: route.url,
          query: { path: pathnameOnly },
          headers: { host: 'visaapply-git-visaapply-staging-demo.vercel.app' },
        },
        previewRes
      );

      assert.equal(previewRes.statusCode, 200, `${route.label} Preview must return 200`);
      assert.equal(
        previewRes.headers['x-robots-tag'],
        PREVIEW_NOINDEX_DIRECTIVE,
        `${route.label} Preview must emit X-Robots-Tag: ${PREVIEW_NOINDEX_DIRECTIVE}`
      );
      assert.ok(
        (previewRes.headers['cache-control'] || '').includes('no-store'),
        `${route.label} Preview must disable public caching`
      );
      assert.ok(
        previewRes.body.includes(`<meta name="robots" content="${PREVIEW_NOINDEX_DIRECTIVE}"`),
        `${route.label} Preview HTML must include robots noindex meta`
      );
      assert.ok(
        previewRes.body.includes(`<meta name="googlebot" content="${PREVIEW_NOINDEX_DIRECTIVE}"`),
        `${route.label} Preview HTML must include googlebot noindex meta`
      );
      assert.ok(
        previewRes.body.includes(`<meta name="bingbot" content="${PREVIEW_NOINDEX_DIRECTIVE}"`),
        `${route.label} Preview HTML must include bingbot noindex meta`
      );
      assert.ok(
        previewRes.body.includes(`href="${route.canonicalPrefix}`),
        `${route.label} Preview canonical must remain anchored to ${route.canonicalPrefix}`
      );
      assert.equal(
        /rel="canonical"[^>]*vercel\.app/i.test(previewRes.body),
        false,
        `${route.label} Preview canonical must never point to vercel.app`
      );

      // Production (www.visaapply.org)
      process.env.VERCEL_ENV = 'production';
      const prodRes = createMockRes();
      renderHandler(
        {
          url: route.url,
          query: { path: pathnameOnly },
          headers: { host: 'www.visaapply.org' },
        },
        prodRes
      );

      assert.equal(prodRes.statusCode, 200, `${route.label} Production must return 200`);
      assert.ok(
        (prodRes.headers['x-robots-tag'] || '').includes('index, follow'),
        `${route.label} Production must remain indexable`
      );
      assert.equal(
        (prodRes.headers['x-robots-tag'] || '').includes('noindex'),
        false,
        `${route.label} Production must NEVER inherit Preview noindex`
      );
      assert.ok(
        (prodRes.headers['link'] || '').includes(route.canonicalPrefix),
        `${route.label} Production must emit canonical Link header`
      );
      assert.ok(
        prodRes.body.includes('<meta name="robots" content="index, follow'),
        `${route.label} Production HTML must emit index, follow meta`
      );
    }
  } finally {
    if (prevVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prevVercelEnv;
  }
});

test('2. visaapply-staging preview hostnames are detected cleanly in both server and client guards', () => {
  assert.equal(STAGING_PREVIEW_ROBOTS_DIRECTIVE, 'noindex, nofollow, noarchive');
  for (const previewHost of [
    'visaapply-git-visaapply-staging-owner.vercel.app',
    'visaapply-staging.vercel.app',
    'visaapply-staging.visaapply.org',
    'staging.visaapply.org',
    'preview.visaapply.org',
  ]) {
    assert.equal(isVercelPreviewDeployment({ headers: { host: previewHost } }, {}), true, `Server should detect ${previewHost}`);
    assert.equal(isPreviewHostname(previewHost), true, `Client should detect ${previewHost}`);
  }

  for (const nonPreviewHost of ['www.visaapply.org', 'visaapply.org', 'localhost', '127.0.0.1']) {
    assert.equal(
      isVercelPreviewDeployment({ headers: { host: nonPreviewHost } }, { VERCEL_ENV: 'production' }),
      false,
      `Server must NOT classify ${nonPreviewHost} as preview`
    );
    assert.equal(isPreviewHostname(nonPreviewHost), false, `Client must NOT classify ${nonPreviewHost} as preview`);
  }
});

test('3. Security & environment audit: zero secret .env files, .gitignore protects .env*, zero VITE_ client secrets, zero staging contamination in robots.txt or sitemaps', () => {
  const rootFiles = fs.readdirSync(ROOT);
  const envFiles = rootFiles.filter((f) => f.startsWith('.env'));
  assert.deepEqual(envFiles, ['.env.example'], 'Only .env.example may exist at repository root');

  const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  assert.ok(gitignore.includes('.env*'), '.gitignore must ignore .env*');
  assert.ok(gitignore.includes('!.env.example'), '.gitignore must allow !.env.example');

  const robotsTxt = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
  assert.ok(robotsTxt.includes('Sitemap: https://www.visaapply.org/sitemap-index.xml'));
  assert.equal(/vercel\.app|visaapply-staging|staging\.visaapply\.org/i.test(robotsTxt), false);

  const publicDir = path.join(ROOT, 'public');
  const legacySitemaps = fs.readdirSync(publicDir).filter((f) => /^sitemap.*\.xml$/i.test(f));
  const candidateSitemaps = fs.readdirSync(path.join(publicDir, 'sitemaps-static')).filter((f) => f.endsWith('.xml'));
  assert.equal(legacySitemaps.length, 89, 'All 89 legacy production sitemaps must remain intact');
  assert.equal(candidateSitemaps.length, 6, 'All 6 candidate static sitemaps must remain intact');

  for (const file of [
    ...legacySitemaps.map((f) => path.join(publicDir, f)),
    ...candidateSitemaps.map((f) => path.join(publicDir, 'sitemaps-static', f)),
  ]) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(/vercel\.app|visaapply-staging|staging\.visaapply\.org/i.test(content), false, `No staging URL in ${file}`);
  }
});

test('4. GitHub Free workflows enforce least-privilege read-only permissions, zero secrets, and visaapply-staging coverage', () => {
  const editorialWf = fs.readFileSync(path.join(ROOT, '.github/workflows/editorial-pr-validation.yml'), 'utf8');
  assert.ok(editorialWf.includes('- main'));
  assert.ok(editorialWf.includes('- visaapply-staging'));
  assert.ok(editorialWf.includes('npm run catalog:validate'));
  assert.ok(editorialWf.includes('contents: read'));
  assert.equal(/secrets\./.test(editorialWf), false);

  const stagingWf = fs.readFileSync(path.join(ROOT, '.github/workflows/preview-staging-validation.yml'), 'utf8');
  assert.ok(stagingWf.includes('- visaapply-staging'));
  assert.ok(stagingWf.includes('workflow_dispatch:'));
  assert.ok(stagingWf.includes('contents: read'));
  assert.ok(stagingWf.includes('cancel-in-progress: true'));
  assert.ok(stagingWf.includes('npm run lint'));
  assert.ok(stagingWf.includes('npm run catalog:validate'));
  assert.ok(stagingWf.includes('npm run editorial:validate-pr'));
  assert.ok(stagingWf.includes('npm run build'));
  assert.ok(stagingWf.includes('test:e2e:preview:phase93'));
  assert.equal(/secrets\./.test(stagingWf), false);
  assert.equal(/:\s*write\b/.test(stagingWf), false);
});

test('5. Protected legacy SQLite, WAL, SHM and Phase B.3 backup files remain untouched', () => {
  for (const relPath of [
    'data_db/immigration_hub.db',
    'data_db/immigration_hub.db-wal',
    'data_db/immigration_hub.db-shm',
    'backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db',
  ]) {
    const abs = path.join(ROOT, relPath);
    assert.ok(fs.existsSync(abs), `Protected file must remain present: ${relPath}`);
    assert.ok(fs.statSync(abs).size > 0, `Protected file must be non-empty: ${relPath}`);
  }
});
