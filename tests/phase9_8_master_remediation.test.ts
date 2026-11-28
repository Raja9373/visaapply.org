import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer.js';
import { getSecurityHeaders } from '../src/utils/securityHardening.js';
import { isRouteRegisteredInSeoManager } from '../src/utils/seoMetadataManager.js';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();

// ============================================================================
// 9.8.1 — API NATIVE ESM STATIC CHECK & @vercel/node PACKAGING + RUNTIME TESTS
// ============================================================================

test('9.8.1a: All 8 api/*.ts handlers and their transitive imports use explicit .js ESM extensions and zero CommonJS __dirname', () => {
  const apiDir = path.join(ROOT, 'api');
  const apiEntries = fs
    .readdirSync(apiDir)
    .filter((f) => f.endsWith('.ts'))
    .sort();
  assert.deepEqual(
    apiEntries,
    ['admin.ts', 'ai-eligibility.ts', 'countries.ts', 'cron.ts', 'faq.ts', 'guides.ts', 'render.ts', 'sitemap.ts'],
    'Expected all 8 API entrypoint files'
  );

  const visited = new Set<string>();
  const issues: string[] = [];

  function scan(filePath: string) {
    const abs = path.resolve(filePath);
    if (visited.has(abs) || !fs.existsSync(abs)) return;
    visited.add(abs);
    const src = fs.readFileSync(abs, 'utf8');

    // Static runtime imports/re-exports (ignore erased `import type` / `export type` statements)
    const staticRe = /^\s*(?:import|export)\s+(?!type\b)(?:[^;'"\n]+\s+from\s+)?['"](\.[^'"]+)['"]/gm;
    let m: RegExpExecArray | null;
    while ((m = staticRe.exec(src)) !== null) {
      checkSpec(abs, m[1]);
    }
    const dynRe = /import\(\s*['"](\.[^'"]+)['"]\s*\)/g;
    while ((m = dynRe.exec(src)) !== null) {
      checkSpec(abs, m[1]);
    }
    if (abs.startsWith(apiDir) && /\b__dirname\b/.test(src)) {
      issues.push(`${path.relative(ROOT, abs)} uses CommonJS __dirname in ESM API handler`);
    }
  }

  function checkSpec(fromAbs: string, spec: string) {
    if (!/\.(js|json|mjs|cjs)$/.test(spec)) {
      issues.push(`${path.relative(ROOT, fromAbs)} -> missing explicit extension: ${spec}`);
    }
    const base = path.resolve(path.dirname(fromAbs), spec.replace(/\.js$/, ''));
    for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, 'index.ts')]) {
      if (fs.existsSync(candidate)) {
        scan(candidate);
        break;
      }
    }
  }

  for (const entry of apiEntries) {
    scan(path.join(apiDir, entry));
  }

  assert.ok(visited.size >= 40, `Expected full transitive scan of API graph, got ${visited.size} files`);
  assert.deepEqual(issues, [], `ESM import issues found:\n${issues.join('\n')}`);
});

test('9.8.1b: Real @vercel/node Lambda packaging and plain native Node.js ESM execution succeed for ALL 8 api/*.ts handlers', async () => {
  const vercelNode = require('@vercel/node');
  const { FileFsRef } = createRequire(require.resolve('@vercel/node'))('@vercel/build-utils');
  const tempWorkBase = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-p98-vercel-'));
  const vercelDirInRoot = path.join(ROOT, '.vercel');
  const hadVercelDir = fs.existsSync(vercelDirInRoot);

  // Build and execute a packaged Lambda function inside plain native `node` (zero tsx/bundler)
  const buildAndRun = async (
    entrypoint: string,
    includeFiles: string[],
    invokeCode: string
  ): Promise<any> => {
    const files: Record<string, any> = {};

    const addFile = (rel: string) => {
      const abs = path.join(ROOT, rel);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        files[rel] = new FileFsRef({ fsPath: abs, mode: 0o100644 });
      }
    };

    const addDirRecursive = (relDir: string) => {
      const absDir = path.join(ROOT, relDir);
      if (!fs.existsSync(absDir)) return;
      for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
        const rel = path.join(relDir, entry.name);
        if (entry.isDirectory()) addDirRecursive(rel);
        else if (/\.(ts|js|json|xml|html)$/.test(entry.name)) addFile(rel);
      }
    };

    addFile('package.json');
    addFile('tsconfig.json');
    addFile('vercel.json');
    addFile('index.html');
    addFile(entrypoint);
    addDirRecursive('src/api');
    addDirRecursive('src/utils');
    addDirRecursive('src/data');
    addDirRecursive('src/i18n');
    addDirRecursive('src/config');
    addDirRecursive('src/schemas');
    for (const extra of includeFiles) addFile(extra);

    const includeSpec =
      includeFiles.length === 1
        ? includeFiles[0]
        : includeFiles.length > 1
          ? `{${includeFiles.join(',')}}`
          : undefined;

    const buildResult = await vercelNode.build({
      files,
      entrypoint,
      workPath: ROOT,
      config: { includeFiles: includeSpec },
      meta: { skipDownload: true, isDev: false },
    });

    const lambda = buildResult.output;
    const lambdaFiles = lambda.files || {};
    const outDir = fs.mkdtempSync(path.join(tempWorkBase, 'exec-'));
    for (const [relPath, fileRef] of Object.entries<any>(lambdaFiles)) {
      const dest = path.join(outDir, relPath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      if (typeof fileRef?.data === 'string' || Buffer.isBuffer(fileRef?.data)) {
        fs.writeFileSync(dest, fileRef.data);
      } else if (fileRef?.fsPath && fs.existsSync(fileRef.fsPath)) {
        fs.copyFileSync(fileRef.fsPath, dest);
      } else if (typeof fileRef?.toStream === 'function') {
        const chunks: Buffer[] = [];
        for await (const chunk of fileRef.toStream()) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        fs.writeFileSync(dest, Buffer.concat(chunks));
      }
    }

    // Ensure dist/index.html or public sitemaps are placed in exec root when needed
    for (const extra of includeFiles) {
      const srcAbs = path.join(ROOT, extra);
      const destAbs = path.join(outDir, extra);
      if (fs.existsSync(srcAbs) && !fs.existsSync(destAbs)) {
        fs.mkdirSync(path.dirname(destAbs), { recursive: true });
        fs.copyFileSync(srcAbs, destAbs);
      }
    }

    const handlerRel = String(lambda.handler || entrypoint.replace(/\.ts$/, '.js'));
    const handlerAbs = path.join(outDir, handlerRel);
    assert.ok(fs.existsSync(handlerAbs), `Packaged handler missing: ${handlerRel} for ${entrypoint}`);
    const resultFile = path.join(outDir, '__p98_result.json');

    const script = `
      import fs from 'node:fs';
      import { pathToFileURL } from 'node:url';
      const mod = await import(pathToFileURL(${JSON.stringify(handlerAbs)}).href);
      const handler = mod.default || mod;
      const emit = (val) => fs.writeFileSync(${JSON.stringify(resultFile)}, JSON.stringify(val), 'utf8');
      function makeRes() {
        const headers = {};
        let statusCode = 200;
        let body = '';
        return {
          status(code) { statusCode = code; return this; },
          setHeader(k, v) { headers[String(k).toLowerCase()] = v; return this; },
          getHeader(k) { return headers[String(k).toLowerCase()]; },
          json(obj) { body = JSON.stringify(obj); return this; },
          send(val) { body = typeof val === 'string' ? val : JSON.stringify(val); return this; },
          end(val) { if (val !== undefined) body += String(val); return this; },
          _out() { return { statusCode, headers, body }; }
        };
      }
      ${invokeCode}
    `;

    execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd: outDir,
      encoding: 'utf8',
      timeout: 30000,
      env: { ...process.env, NODE_ENV: 'production', GEMINI_API_KEY: '', ADMIN_PASSWORD: 'test-admin-secret-value-98', CRON_SECRET: 'test-cron-secret-value-98' },
    });
    return JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  };

  try {
    // 1. /api/countries (returns array of 86 curated countries)
    const countriesOut = await buildAndRun(
      'api/countries.ts',
      [],
      `const res = makeRes(); await handler({ method: 'GET', url: '/api/countries', headers: {} }, res); emit(res._out());`
    );
    assert.equal(countriesOut.statusCode, 200);
    assert.equal(countriesOut.headers['x-content-type-options'], 'nosniff');
    assert.equal(countriesOut.headers['x-frame-options'], 'DENY');
    const countriesJson = JSON.parse(countriesOut.body);
    assert.ok(Array.isArray(countriesJson) && countriesJson.length === 86, `Expected 86 curated countries, got ${countriesJson?.length}`);
    assert.equal(countriesJson[0].code, 'US');

    // 2. /api/guides (returns { published, drafts, total })
    const guidesOut = await buildAndRun(
      'api/guides.ts',
      [],
      `const res = makeRes(); await handler({ method: 'GET', url: '/api/guides', headers: {} }, res); emit(res._out());`
    );
    assert.equal(guidesOut.statusCode, 200);
    assert.equal(guidesOut.headers['x-content-type-options'], 'nosniff');
    const guidesJson = JSON.parse(guidesOut.body);
    assert.ok(Array.isArray(guidesJson.published) && guidesJson.published.length > 0);
    assert.equal(guidesJson.total, guidesJson.published.length);

    // 3. /api/faq
    const faqOut = await buildAndRun(
      'api/faq.ts',
      [],
      `const res = makeRes(); await handler({ method: 'GET', url: '/api/faq?country=us', query: { country: 'us' }, headers: {} }, res); emit(res._out());`
    );
    assert.equal(faqOut.statusCode, 200);
    assert.equal(faqOut.headers['x-content-type-options'], 'nosniff');
    const faqJson = JSON.parse(faqOut.body);
    assert.equal(faqJson.success, true);
    assert.ok(Array.isArray(faqJson.faqs) && faqJson.faqs.length > 0);

    // 4. /api/sitemap (handles both flat sitemap.xml and sitemap-index.xml)
    const sitemapOut = await buildAndRun(
      'api/sitemap.ts',
      ['public/sitemap-index.xml', 'public/sitemap.xml', 'public/sitemap_index.xml'],
      `
      const rFlat = makeRes(); await handler({ method: 'GET', url: '/api/sitemap', headers: {} }, rFlat);
      const rIdx = makeRes(); await handler({ method: 'GET', url: '/api/sitemap?file=sitemap-index.xml', headers: {} }, rIdx);
      emit({ flat: rFlat._out(), idx: rIdx._out() });
      `
    );
    assert.equal(sitemapOut.flat.statusCode, 200);
    assert.equal(sitemapOut.flat.headers['x-robots-tag'], 'noindex, follow');
    assert.ok(sitemapOut.flat.body.includes('<urlset') && sitemapOut.flat.body.includes('https://www.visaapply.org/'));
    assert.equal(sitemapOut.idx.statusCode, 200);
    assert.equal(sitemapOut.idx.headers['x-robots-tag'], 'noindex, follow');
    assert.ok(sitemapOut.idx.body.includes('<sitemapindex') && sitemapOut.idx.body.includes('/sitemaps-static/sitemap-static-core.xml'));

    // 5. /api/ai-eligibility (GET -> 405, valid POST -> 200 fallback)
    const aiOut = await buildAndRun(
      'api/ai-eligibility.ts',
      [],
      `
      const r1 = makeRes(); await handler({ method: 'GET', url: '/api/ai-eligibility', headers: {} }, r1);
      const r2 = makeRes(); await handler({ method: 'POST', url: '/api/ai-eligibility', headers: { 'content-type': 'application/json' }, body: { fromCode: 'in', toCode: 'ca', visaType: 'tourist', duration: '14 days', passportValidity: '12+ months', monthlyIncome: '$3000', bankBalance: '$10000', travelHistory: '2 Schengen trips', jobType: 'Software Engineer' } }, r2);
      emit({ get: r1._out(), post: r2._out() });
      `
    );
    assert.equal(aiOut.get.statusCode, 405);
    assert.equal(aiOut.post.statusCode, 200);
    const aiPostJson = JSON.parse(aiOut.post.body);
    assert.equal(typeof aiPostJson.score, 'number');
    assert.ok(['High Chance', 'Medium Chance', 'Low Chance'].includes(aiPostJson.verdict));

    // 6. /api/admin (unauthenticated must reject with 401/403)
    const adminOut = await buildAndRun(
      'api/admin.ts',
      [],
      `const res = makeRes(); await handler({ method: 'GET', url: '/api/admin/drafts', headers: {} }, res); emit(res._out());`
    );
    assert.ok(adminOut.statusCode === 401 || adminOut.statusCode === 403, `Expected 401/403 on unauthenticated /api/admin, got ${adminOut.statusCode}`);

    // 7. /api/cron (unauthenticated must reject with 401/403)
    const cronOut = await buildAndRun(
      'api/cron.ts',
      [],
      `const res = makeRes(); await handler({ method: 'GET', url: '/api/cron', headers: {} }, res); emit(res._out());`
    );
    assert.ok(cronOut.statusCode === 401 || cronOut.statusCode === 403, `Expected 401/403 on unauthenticated /api/cron, got ${cronOut.statusCode}`);

    // 8. /api/render (verified 200 routes + true 404 routes)
    const renderOut = await buildAndRun(
      'api/render.ts',
      ['dist/index.html'],
      `
      const results = {};
      for (const p of ['/immigration', '/immigration/us', '/in-to-ca-tourist', '/tools/visa-comparison', '/ar', '/ar/immigration', '/nonexistent-route-audit-97f', '/zz-to-xx']) {
        const r = makeRes();
        await handler({ method: 'GET', url: '/api/render?path=' + encodeURIComponent(p), query: { path: p }, headers: { host: 'www.visaapply.org' } }, r);
        results[p] = { statusCode: r._out().statusCode, headers: r._out().headers, title: (r._out().body.match(/<title>([^<]+)<\\/title>/) || [])[1] || '', hasCanonical: /<link\s+[^>]*rel="canonical"/i.test(r._out().body), htmlTag: (r._out().body.match(/<html[^>]*>/i) || [])[0] || '' };
      }
      emit(results);
      `
    );
    assert.equal(renderOut['/immigration'].statusCode, 200);
    assert.equal(renderOut['/immigration/us'].statusCode, 200);
    assert.equal(renderOut['/in-to-ca-tourist'].statusCode, 200);
    assert.equal(renderOut['/tools/visa-comparison'].statusCode, 200);
    assert.ok(renderOut['/tools/visa-comparison'].title.includes('Visa Comparison'));
    assert.equal(renderOut['/ar'].statusCode, 200);
    assert.ok(renderOut['/ar'].htmlTag.includes('lang="ar"') && renderOut['/ar'].htmlTag.includes('dir="rtl"'));
    assert.equal(renderOut['/ar/immigration'].statusCode, 200);
    assert.ok(renderOut['/ar/immigration'].htmlTag.includes('lang="en"'));
    assert.equal(renderOut['/nonexistent-route-audit-97f'].statusCode, 404);
    assert.equal(renderOut['/nonexistent-route-audit-97f'].headers['x-robots-tag'], 'noindex, nofollow');
    assert.equal(renderOut['/nonexistent-route-audit-97f'].headers['link'], undefined);
    assert.equal(renderOut['/nonexistent-route-audit-97f'].hasCanonical, false);
    assert.equal(renderOut['/zz-to-xx'].statusCode, 404);
  } finally {
    fs.rmSync(tempWorkBase, { recursive: true, force: true });
    if (!hadVercelDir && fs.existsSync(vercelDirInRoot)) {
      fs.rmSync(vercelDirInRoot, { recursive: true, force: true });
    }
  }
});

// ============================================================================
// 9.8.2 — GLOBAL PRODUCTION SECURITY HEADERS IN vercel.json
// ============================================================================

test('9.8.2: vercel.json configures complete global and API security headers matching securityHardening with zero duplicates or global noindex', () => {
  const vercelJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const expectedGlobal = getSecurityHeaders({ isApi: false, allowPreviewFraming: false });
  const expectedApi = getSecurityHeaders({ isApi: true, allowPreviewFraming: false });

  const globalRule = vercelJson.headers.find((h: any) => h.source === '/(.*)');
  assert.ok(globalRule, 'vercel.json must define global "/(.*)" security headers rule');
  const globalMap = new Map<string, string>();
  for (const h of globalRule.headers) {
    const k = String(h.key);
    assert.equal(globalMap.has(k.toLowerCase()), false, `Duplicate header ${k} in /(.*) rule`);
    globalMap.set(k.toLowerCase(), String(h.value));
  }
  for (const [k, v] of Object.entries(expectedGlobal)) {
    assert.equal(globalMap.get(k.toLowerCase()), v, `Global header mismatch for ${k}`);
  }

  const apiRule = vercelJson.headers.find((h: any) => h.source === '/api/(.*)');
  assert.ok(apiRule, 'vercel.json must define "/api/(.*)" strict API headers override');
  const apiMap = new Map<string, string>(apiRule.headers.map((h: any) => [String(h.key).toLowerCase(), String(h.value)]));
  assert.equal(apiMap.get('content-security-policy'), expectedApi['Content-Security-Policy']);
  assert.equal(apiMap.get('x-frame-options'), 'DENY');

  // Verify api/sitemap.ts includes root XML files in Vercel bundle
  assert.ok(
    vercelJson.functions?.['api/sitemap.ts']?.includeFiles?.includes('sitemap-index.xml'),
    'api/sitemap.ts must bundle public sitemap XML files'
  );
});

// ============================================================================
// 9.8.3 & 9.8.4 — TRUE 404, DEDICATED TOOL SEO, BILATERAL DESCRIPTIONS,
//                  MULTILINGUAL LANG/RTL/HREFLANG & SINGLE ORGANIZATION SCHEMA
// ============================================================================

test('9.8.3: All 16 Phase 9.7 SSR routes resolve HTTP 200 while unknown/invalid routes return true HTTP 404 + noindex', () => {
  const validRoutes = [
    '/',
    '/immigration',
    '/immigration/us',
    '/immigration/ca',
    '/immigration/gb',
    '/in-to-ca-tourist',
    '/in-to-us',
    '/in-to-gb-work',
    '/tools/visa-comparison',
    '/tools/cost-calculator',
    '/tools/document-checklist',
    '/visa/us/us-h1b-specialty',
    '/visa/japan/digital-nomad-visa',
    '/blogs',
    '/routes',
    '/about',
  ];
  for (const r of validRoutes) {
    const payload = renderRouteSsrPayload(r);
    assert.equal(payload.statusCode, 200, `Expected HTTP 200 for ${r}`);
    assert.equal(payload.robots.includes('noindex'), false, `Valid route ${r} must be indexable`);
    assert.ok(payload.canonicalUrl.startsWith('https://www.visaapply.org/'), `Missing canonical URL for ${r}`);
  }

  const invalidRoutes = [
    '/nonexistent-route-audit-97f',
    '/does-not-exist',
    '/zz-to-xx',
    '/immigration/zz',
    '/tools/nonexistent-tool-xyz',
    '/visa/nonexistent/fake-pathway',
  ];
  const baseHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const r of invalidRoutes) {
    const payload = renderRouteSsrPayload(r);
    assert.equal(payload.statusCode, 404, `Expected HTTP 404 for ${r}`);
    assert.equal(payload.robots, 'noindex, nofollow', `Expected noindex, nofollow for ${r}`);
    assert.equal(payload.canonicalUrl, '', `Expected empty canonicalUrl for 404 route ${r}`);
    const html = injectSsrPayloadIntoHtml(baseHtml, payload);
    assert.equal(/<link\s+rel="canonical"/i.test(html), false, `404 HTML for ${r} must omit canonical link`);
    assert.equal(/hreflang=/i.test(html), false, `404 HTML for ${r} must omit hreflang links`);
    assert.ok(html.includes('404 – Page Not Found'), `404 HTML for ${r} must include branded 404 heading`);
  }
});

test('9.8.4: Dedicated tool SEO, concise bilateral descriptions, honest multilingual lang/RTL/hreflang, and single Organization JSON-LD', () => {
  const baseHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // 1. Dedicated /tools/visa-comparison metadata (no homepage fallback)
  const homePayload = renderRouteSsrPayload('/');
  const comparePayload = renderRouteSsrPayload('/tools/visa-comparison');
  assert.notEqual(comparePayload.title, homePayload.title);
  assert.ok(comparePayload.title.includes('Visa Comparison'));
  assert.ok(comparePayload.description.length >= 110 && comparePayload.description.length <= 165);

  // 2. Concise natural bilateral meta descriptions (down from 326–424 chars)
  for (const route of ['/in-to-ca-tourist', '/in-to-us', '/in-to-gb-work']) {
    const p = renderRouteSsrPayload(route);
    assert.ok(
      p.description.length >= 110 && p.description.length <= 170,
      `Bilateral description for ${route} should be ~140-160 chars, got ${p.description.length}: ${p.description}`
    );
  }

  // 3. Localized UI routes emit accurate lang, RTL for Arabic, og:locale, and 16 hreflang alternates
  const arHomeHtml = injectSsrPayloadIntoHtml(baseHtml, renderRouteSsrPayload('/ar'));
  assert.ok(arHomeHtml.includes('<html lang="ar" dir="rtl">'), 'Arabic homepage must emit lang="ar" dir="rtl"');
  assert.ok(arHomeHtml.includes('content="ar_AE"'), 'Arabic homepage must emit og:locale ar_AE');
  assert.equal((arHomeHtml.match(/hreflang="/g) || []).length, 16, 'Arabic homepage must emit 16 hreflang alternates');

  const arBilateralHtml = injectSsrPayloadIntoHtml(baseHtml, renderRouteSsrPayload('/ar/in-to-ca-tourist'));
  assert.ok(arBilateralHtml.includes('<html lang="ar" dir="rtl">'));

  // 4. Untranslated English-only immigration routes emit lang="en", explicit fallback banner, and ONLY en + x-default hreflang
  const arImmPayload = renderRouteSsrPayload('/ar/immigration/us');
  assert.equal(arImmPayload.htmlLang, 'en');
  assert.equal(arImmPayload.isEnglishFallback, true);
  const arImmHtml = injectSsrPayloadIntoHtml(baseHtml, arImmPayload);
  assert.ok(arImmHtml.includes('<html lang="en" dir="ltr">'));
  assert.ok(arImmHtml.includes('data-language-fallback="true"'), 'Untranslated route must disclose English-content fallback');
  assert.equal((arImmHtml.match(/hreflang="/g) || []).length, 2, 'Untranslated route must emit only en + x-default hreflang');

  // 5. Single Organization JSON-LD node across full SSR document (no duplicate)
  for (const r of ['/', '/immigration/us', '/in-to-ca-tourist', '/tools/visa-comparison']) {
    const html = injectSsrPayloadIntoHtml(baseHtml, renderRouteSsrPayload(r));
    const orgMatches = html.match(/"@type"\s*:\s*"Organization"/g) || [];
    assert.equal(orgMatches.length, 1, `Expected exactly 1 Organization JSON-LD node on ${r}, found ${orgMatches.length}`);
  }
});

// ============================================================================
// 9.8.5 — VERIFIED-ONLY PUBLIC SITEMAPS & PRESERVED QUARANTINE DATA
// ============================================================================

test('9.8.5: Public sitemaps advertise only verified, published, indexable URLs while preserving all quarantined country records in data/', () => {
  const publicDir = path.join(ROOT, 'public');
  const rootSitemaps = fs
    .readdirSync(publicDir)
    .filter((f) => /^sitemap.*\.xml$/i.test(f))
    .sort();
  assert.deepEqual(rootSitemaps, ['sitemap-index.xml', 'sitemap.xml', 'sitemap_index.xml']);

  const indexXml = fs.readFileSync(path.join(publicDir, 'sitemap-index.xml'), 'utf8');
  assert.ok(indexXml.includes('<sitemapindex'));
  assert.ok(indexXml.includes('/sitemaps-static/sitemap-static-core.xml'));
  assert.ok(indexXml.includes('/sitemaps-static/sitemap-static-countries.xml'));
  assert.ok(indexXml.includes('/sitemaps-static/sitemap-static-programs.xml'));
  assert.ok(indexXml.includes('/sitemaps-static/sitemap-static-routes.xml'));
  assert.ok(indexXml.includes('/sitemaps-static/sitemap-static-editorial.xml'));

  const flatXml = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8');
  const locs = [...flatXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, 56);
  assert.equal(new Set(locs).size, 56, 'Zero duplicate URLs in public/sitemap.xml');

  // Verify every emitted lastmod is valid ISO YYYY-MM-DD
  const lastmods = [...flatXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  assert.equal(lastmods.length, 56);
  for (const lm of lastmods) {
    assert.match(lm, /^\d{4}-\d{2}-\d{2}$/, `Invalid lastmod format: ${lm}`);
  }

  // Verify ALL quarantined country records are preserved on disk in data/ AND strictly excluded from public sitemaps
  const countriesDir = path.join(ROOT, 'data/countries');
  const countryFiles = fs.readdirSync(countriesDir).filter((f) => f.endsWith('.json'));
  assert.equal(countryFiles.length, 249, 'All 249 ISO country records must remain preserved in data/countries/');

  let quarantinedCount = 0;
  for (const cf of countryFiles) {
    const rec = JSON.parse(fs.readFileSync(path.join(countriesDir, cf), 'utf8'));
    if (rec.recordStatus !== 'ACTIVE') {
      quarantinedCount++;
      assert.equal(
        locs.includes(`https://www.visaapply.org/immigration/${rec.slug}`),
        false,
        `Non-ACTIVE country leaked into public sitemap: ${rec.slug} (${rec.recordStatus})`
      );
    }
  }
  assert.equal(quarantinedCount, 235, 'Expected 228 quarantined + 7 uninhabited = 235 non-ACTIVE country records preserved in data/');

  // Every single URL in public/sitemap.xml resolves HTTP 200 & indexable
  for (const loc of locs) {
    const pathname = new URL(loc).pathname;
    assert.equal(isRouteRegisteredInSeoManager(pathname).registered, true, `Sitemap URL unregistered: ${pathname}`);
    const ssr = renderRouteSsrPayload(pathname);
    assert.equal(ssr.statusCode, 200, `Sitemap URL must resolve 200: ${pathname}`);
    assert.equal(ssr.robots.includes('noindex'), false, `Sitemap URL must be indexable: ${pathname}`);
  }
});

// ============================================================================
// 9.8.6 — PERFORMANCE OPTIMIZATIONS & BUNDLE BUDGET VERIFICATION
// ============================================================================

test('9.8.6: Performance optimizations shrink geo-map and entry JS, split legal/admin views, and prevent SW precaching of heavy lazy chunks', () => {
  const distAssetsDir = path.join(ROOT, 'dist/assets');
  const files = fs.readdirSync(distAssetsDir);

  const indexJs = files.find((f) => /^index-[a-zA-Z0-9_-]+\.js$/.test(f));
  const geoMapJs = files.find((f) => /^geo-map-[a-zA-Z0-9_-]+\.js$/.test(f));
  const staticLegalJs = files.find((f) => /^StaticLegalViews-[a-zA-Z0-9_-]+\.js$/.test(f));
  const adminInlineJs = files.find((f) => /^AdminInlineViews-[a-zA-Z0-9_-]+\.js$/.test(f));

  assert.ok(indexJs, 'Expected index-*.js entry chunk');
  assert.ok(geoMapJs, 'Expected geo-map-*.js chunk');
  assert.ok(staticLegalJs, 'Expected StaticLegalViews lazy chunk');
  assert.ok(adminInlineJs, 'Expected AdminInlineViews lazy chunk');

  const indexBuf = fs.readFileSync(path.join(distAssetsDir, indexJs));
  const indexGz = zlib.gzipSync(indexBuf).length;
  const geoBuf = fs.readFileSync(path.join(distAssetsDir, geoMapJs));

  assert.ok(indexBuf.length < 880 * 1024, `Entry JS raw size expected < 880 KB, got ${(indexBuf.length / 1024).toFixed(1)} KB`);
  assert.ok(indexGz < 200 * 1024, `Entry JS gzip size expected < 200 KB, got ${(indexGz / 1024).toFixed(1)} KB`);
  assert.ok(geoBuf.length < 260 * 1024, `geo-map chunk expected < 260 KB raw (down from 1,196.7 KB), got ${(geoBuf.length / 1024).toFixed(1)} KB`);

  // Verify PWA Workbox service worker does NOT precache multi-MB on-demand chunks
  const swPath = path.join(ROOT, 'dist/sw.js');
  if (fs.existsSync(swPath)) {
    const sw = fs.readFileSync(swPath, 'utf8');
    assert.equal(sw.includes('fullVisaDatabase-'), false, 'SW must not eagerly precache 3.3 MB fullVisaDatabase');
    assert.equal(sw.includes('geo-map-'), false, 'SW must not eagerly precache geo-map');
    assert.equal(sw.includes('pdf-tools-'), false, 'SW must not eagerly precache pdf-tools');
  }
});
