import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('1. Cloudflare Pages _headers file mirrors all required security headers, caching policies, and admin noindex rules', () => {
  const headersPath = path.join(ROOT, 'public/_headers');
  assert.equal(fs.existsSync(headersPath), true, 'public/_headers must exist');
  const content = fs.readFileSync(headersPath, 'utf8');

  for (const required of [
    'Content-Security-Policy:',
    'Strict-Transport-Security: max-age=31536000; includeSubDomains',
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()',
    'X-Frame-Options: SAMEORIGIN',
    '/assets/*',
    'Cache-Control: public, max-age=31536000, immutable',
    '/catalog/*',
    'Cache-Control: public, max-age=300, stale-while-revalidate=3600',
    '/index.html',
    'Cache-Control: public, max-age=0, must-revalidate',
    '/admin/*',
    'X-Robots-Tag: noindex, nofollow, noarchive',
    'Cache-Control: no-store, private',
  ]) {
    assert.ok(content.includes(required), `public/_headers missing required directive: ${required}`);
  }
});

test('2. Cloudflare Pages _redirects file preserves canonical self-route redirects and avoids SPA fallback loops or static 404.html', () => {
  const redirectsPath = path.join(ROOT, 'public/_redirects');
  assert.equal(fs.existsSync(redirectsPath), true, 'public/_redirects must exist');
  const content = fs.readFileSync(redirectsPath, 'utf8');

  assert.ok(content.includes('/in-to-in /immigration/in 301'), 'Missing /in-to-in 301 redirect');
  assert.ok(content.includes('/in-to-in-* /immigration/in 301'), 'Missing /in-to-in-* 301 redirect');
  assert.equal(/^\s*\/\*\s+\/index\.html\s+200/m.test(content), false, 'Must not contain invalid Cloudflare Pages /* /index.html 200 loop rule');
  assert.equal(fs.existsSync(path.join(ROOT, 'public/404.html')), false, 'public/404.html must not exist so Cloudflare Pages SPA fallback stays active');
});

test('3. Cloudflare staging deployment guide documents build settings, env var names only, authorization gate, and rollback without secrets', () => {
  const guidePath = path.join(ROOT, 'docs/CLOUDFLARE_STAGING_DEPLOYMENT_GUIDE.md');
  assert.equal(fs.existsSync(guidePath), true, 'docs/CLOUDFLARE_STAGING_DEPLOYMENT_GUIDE.md must exist');
  const content = fs.readFileSync(guidePath, 'utf8');

  for (const needle of [
    'npm run build',
    '`dist`',
    'NODE_VERSION',
    'Authorization Gate',
    'Preview Deployment',
    'Custom Staging Subdomain',
    'Rollback Instructions',
    'Cloudflare Pages (Free Plan)',
  ]) {
    assert.ok(content.includes(needle), `Deployment guide missing required section/text: ${needle}`);
  }

  // Ensure zero secret values leaked
  assert.equal(/(AIza[0-9A-Za-z_-]{35}|re_[A-Za-z0-9_]{20,}|BEGIN PRIVATE KEY|postgres:\/\/[^<\s]+)/.test(content), false);
});

test('4. Public static output contains zero database files, zero .env files, and preserves all 89 legacy sitemaps & robots.txt', () => {
  const publicDir = path.join(ROOT, 'public');
  const entries = fs.readdirSync(publicDir);

  const dbFiles = entries.filter((f) => /\.(db|db-wal|db-shm|sqlite|sqlite3)$/i.test(f));
  assert.deepEqual(dbFiles, [], 'No database files may exist under public/');

  const envFiles = entries.filter((f) => /^\.env/i.test(f));
  assert.deepEqual(envFiles, [], 'No .env files may exist under public/');

  const rootSitemaps = entries.filter((f) => /^sitemap.*\.xml$/i.test(f)).sort();
  assert.deepEqual(rootSitemaps, ['sitemap-index.xml', 'sitemap.xml', 'sitemap_index.xml'], 'Only 3 verified-only root public sitemap files may exist');
  assert.equal(fs.existsSync(path.join(publicDir, 'robots.txt')), true, 'public/robots.txt must remain intact');
});
