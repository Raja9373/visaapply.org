import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = process.cwd();
const require = createRequire(import.meta.url);

const REQUIRED_CORE_ROUTES = [
  '/immigration',
  '/immigration/us',
  '/in-to-ca-tourist',
  '/tools/visa-comparison',
] as const;

const REPRESENTATIVE_BILATERAL_ROUTES = [
  '/in-to-us',
  '/in-to-gb',
  '/in-to-au',
  '/in-to-de',
  '/us-to-gb',
  '/us-to-jp',
  '/gb-to-ca',
  '/ca-to-fr',
  '/au-to-sg',
  '/de-to-ae',
  '/in-to-us-work',
  '/in-to-ca-student',
] as const;

function resolveRelativeSourceExactCase(fromFile: string, specifier: string): string | null {
  const withoutJs = specifier.replace(/\.js$/, '');
  const base = path.resolve(path.dirname(fromFile), withoutJs);
  const candidates = [
    path.resolve(path.dirname(fromFile), specifier),
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    path.join(base, 'index.ts'),
  ];
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) continue;
    const dirEntries = fs.readdirSync(path.dirname(candidate));
    if (dirEntries.includes(path.basename(candidate))) {
      return candidate;
    }
  }
  return null;
}

test('1. Missing-module/import regression guard: every transitive relative import in api/render.ts uses explicit Node.js ESM extension and exact file casing', () => {
  const visited = new Set<string>();
  const violations: string[] = [];

  function walkImports(absFile: string) {
    if (visited.has(absFile)) return;
    visited.add(absFile);

    const relFile = path.relative(ROOT, absFile);
    const source = fs.readFileSync(absFile, 'utf8');
    const importRegex = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"](\.[^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(source)) !== null) {
      const specifier = match[1];
      if (!/\.(js|mjs|cjs|json)$/.test(specifier)) {
        violations.push(`${relFile} imports "${specifier}" without explicit ESM extension (.js)`);
      }
      const resolved = resolveRelativeSourceExactCase(absFile, specifier);
      if (!resolved) {
        violations.push(`${relFile} imports "${specifier}" which does not resolve with exact casing`);
      } else {
        walkImports(resolved);
      }
    }
  }

  walkImports(path.join(ROOT, 'api', 'render.ts'));

  assert.ok(visited.size >= 8, `Expected at least 8 modules in api/render.ts graph, found ${visited.size}`);
  assert.deepEqual(violations, [], `Found Node.js ESM import violations:\n${violations.join('\n')}`);
});

test('2. Real @vercel/node Lambda packaging & native Node.js ESM runtime execution across core SSR routes and 12 bilateral country-to-country routes', async () => {
  const { build } = require('@vercel/node');

  assert.ok(
    fs.existsSync(path.join(ROOT, 'dist', 'index.html')),
    'dist/index.html must exist before verifying Vercel Lambda packaging (run npm run build first)'
  );

  const files: Record<string, { type: 'FileFsRef'; fsPath: string }> = {};
  const addDir = (relDir: string) => {
    const abs = path.join(ROOT, relDir);
    if (!fs.existsSync(abs)) return;
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = path.join(relDir, entry.name);
      if (entry.isDirectory()) addDir(rel);
      else if (entry.isFile()) {
        files[rel] = { type: 'FileFsRef', fsPath: path.join(ROOT, rel) };
      }
    }
  };

  for (const singleFile of ['package.json', 'tsconfig.json', 'vercel.json', 'index.html', 'dist/index.html']) {
    const abs = path.join(ROOT, singleFile);
    if (fs.existsSync(abs)) {
      files[singleFile] = { type: 'FileFsRef', fsPath: abs };
    }
  }
  addDir('api');
  addDir('src');

  const vercelDir = path.join(ROOT, '.vercel');
  const hadVercelDirBefore = fs.existsSync(vercelDir);

  let buildResult: any;
  try {
    buildResult = await build({
      files,
      entrypoint: 'api/render.ts',
      workPath: ROOT,
      config: { includeFiles: 'dist/index.html' },
      meta: { skipDownload: true },
    });
  } finally {
    if (!hadVercelDirBefore && fs.existsSync(vercelDir)) {
      fs.rmSync(vercelDir, { recursive: true, force: true });
    }
  }

  const lambda = buildResult.output;
  const packagedPaths = Object.keys(lambda.files || {}).sort();

  const requiredBundledFiles = [
    'api/render.js',
    'dist/index.html',
    'package.json',
    'src/i18n/config.js',
    'src/utils/authSecurity.js',
    'src/utils/autoLanguage.js',
    'src/utils/operationalObservability.js',
    'src/utils/securityHardening.js',
    'src/utils/seoMetadataManager.js',
    'src/utils/ssrRouteRenderer.js',
  ];

  for (const reqFile of requiredBundledFiles) {
    assert.ok(packagedPaths.includes(reqFile), `Vercel Lambda bundle missing required file: ${reqFile}`);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-vercel-render-'));
  try {
    for (const [rel, ref] of Object.entries(lambda.files || {}) as Array<[string, any]>) {
      const dest = path.join(tmpDir, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      if (ref.data !== undefined) {
        fs.writeFileSync(dest, ref.data);
      } else if (ref.fsPath) {
        fs.copyFileSync(ref.fsPath, dest);
      }
    }

    // Execute the compiled Lambda entrypoint in plain native Node.js ESM (WITHOUT tsx!)
    const allRoutes = [...REQUIRED_CORE_ROUTES, ...REPRESENTATIVE_BILATERAL_ROUTES];
    const runnerScript = `
      import handler from './api/render.js';
      const routes = ${JSON.stringify(allRoutes)};
      const results = [];

      function invoke(routePath, host, vercelEnv) {
        process.env.VERCEL_ENV = vercelEnv;
        const headers = {};
        let statusCode = 200;
        let body = '';
        const res = {
          setHeader(k, v) { headers[String(k).toLowerCase()] = String(v); },
          status(code) { statusCode = code; return this; },
          send(payload) { body = String(payload); return this; },
        };
        handler({ url: routePath, query: { path: routePath }, headers: { host } }, res);
        return { routePath, statusCode, headers, body };
      }

      for (const routePath of routes) {
        const prod = invoke(routePath, 'www.visaapply.org', 'production');
        results.push({
          routePath,
          statusCode: prod.statusCode,
          xRobotsTag: prod.headers['x-robots-tag'] || '',
          canonicalLinkHeader: prod.headers['link'] || '',
          hasCanonicalMeta: prod.body.includes('rel="canonical" href="https://www.visaapply.org' + routePath + '"'),
          hasJsonLd: prod.body.includes('id="ssr-route-jsonld"'),
          hasMainSsrBody: prod.body.includes('<main'),
          hasH1: prod.body.includes('<h1'),
          usedFallbackTemplate: !prod.body.includes('id="ssr-route-jsonld"'),
        });
      }

      const previewCheck = invoke('/immigration/us', 'visaapply-git-visaapply-staging.vercel.app', 'preview');
      console.log(JSON.stringify({
        results,
        previewCheck: {
          statusCode: previewCheck.statusCode,
          xRobotsTag: previewCheck.headers['x-robots-tag'] || '',
          cacheControl: previewCheck.headers['cache-control'] || '',
          hasNoindexMeta: previewCheck.body.includes('content="noindex, nofollow, noarchive"'),
          hasProdCanonical: previewCheck.body.includes('href="https://www.visaapply.org/immigration/us"'),
        }
      }));
    `;

    const stdout = execFileSync(process.execPath, ['--input-type=module', '-e', runnerScript], {
      cwd: tmpDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const parsed = JSON.parse(stdout.trim());
    assert.equal(parsed.results.length, allRoutes.length);

    for (const item of parsed.results) {
      assert.equal(item.statusCode, 200, `Native Node ESM SSR failed for ${item.routePath}`);
      assert.ok(item.xRobotsTag.includes('index, follow'), `Missing index, follow X-Robots-Tag on ${item.routePath}`);
      assert.ok(
        item.canonicalLinkHeader.includes(`https://www.visaapply.org${item.routePath}`),
        `Missing canonical Link header on ${item.routePath}`
      );
      assert.equal(item.hasCanonicalMeta, true, `Missing canonical <link> tag on ${item.routePath}`);
      assert.equal(item.hasJsonLd, true, `Missing SSR JSON-LD on ${item.routePath}`);
      assert.equal(item.hasMainSsrBody, true, `Missing SSR <main> HTML body on ${item.routePath}`);
      assert.equal(item.hasH1, true, `Missing SSR <h1> heading on ${item.routePath}`);
      assert.equal(item.usedFallbackTemplate, false, `Unexpected fallback template used on ${item.routePath}`);
    }

    assert.equal(parsed.previewCheck.statusCode, 200);
    assert.equal(parsed.previewCheck.xRobotsTag, 'noindex, nofollow, noarchive');
    assert.ok(parsed.previewCheck.cacheControl.includes('no-store'));
    assert.equal(parsed.previewCheck.hasNoindexMeta, true);
    assert.equal(parsed.previewCheck.hasProdCanonical, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
