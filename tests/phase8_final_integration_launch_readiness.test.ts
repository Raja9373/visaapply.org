import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateStaticCatalog } from '../scripts/validateStaticCatalog';
import { renderRouteSsrPayload } from '../src/utils/ssrRouteRenderer';
import { getSecurityHeaders } from '../src/utils/securityHardening';

const ROOT = process.cwd();

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function sha256File(relPath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, relPath))).digest('hex');
}

// ============================================================================
// 1. IMMIGRATION DATA INTEGRITY (RECALCULATED DIRECTLY FROM REPOSITORY)
// ============================================================================

test('Phase 8 Data Integrity: 249 countries, 61,752 routes, 1,743 slots, 28 verified programs, 229 quarantined, zero duplicates or leaks', () => {
  const report = validateStaticCatalog({ dataDir: path.join(ROOT, 'data') });
  assert.equal(report.valid, true, `Catalog invalid: ${JSON.stringify(report.errors)}`);
  assert.equal(report.errors.length, 0);

  const countries = fs
    .readdirSync(path.join(ROOT, 'data/countries'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data/countries', f), 'utf-8')));
  assert.equal(countries.length, 249);
  assert.equal(new Set(countries.map((c: any) => c.isoCode)).size, 249, 'Duplicate country ISO codes detected');
  assert.equal(countries.length * (countries.length - 1), 61_752);
  assert.equal(countries.length * 7, 1_743);

  const byCountryStatus: Record<string, number> = {};
  for (const c of countries) {
    byCountryStatus[c.recordStatus] = (byCountryStatus[c.recordStatus] || 0) + 1;
  }
  assert.equal(byCountryStatus.ACTIVE, 14);
  assert.equal(byCountryStatus.QUARANTINED, 228);
  assert.equal(byCountryStatus.UNINHABITED_TERRITORY, 7);

  const programs = fs
    .readdirSync(path.join(ROOT, 'data/programs'))
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => {
      const parsed = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/programs', f), 'utf-8'));
      return Array.isArray(parsed) ? parsed : [parsed];
    });
  assert.equal(programs.length, 28);
  assert.equal(new Set(programs.map((p: any) => p.programId)).size, 28, 'Duplicate program IDs detected');
  for (const p of programs) {
    assert.equal(p.verificationStatus, 'AVAILABLE_VERIFIED');
    assert.equal(p.publicationStatus, 'PUBLISHED');
    assert.ok(!/expired/i.test(p.verificationStatus));
    assert.ok(!/synthetic|placeholder/i.test(p.programId));
  }

  const sources = fs
    .readdirSync(path.join(ROOT, 'data/official-sources'))
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => {
      const parsed = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/official-sources', f), 'utf-8'));
      return Array.isArray(parsed) ? parsed : [parsed];
    });
  assert.equal(sources.length, 61);
  assert.equal(new Set(sources.map((s: any) => s.sourceId)).size, 61, 'Duplicate official source IDs detected');

  const quarantineRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/verification/quarantine.json'), 'utf-8'));
  const qArr = Array.isArray(quarantineRaw) ? quarantineRaw : (quarantineRaw.records || []);
  assert.equal(qArr.length, 229);

  // Verify zero quarantined program IDs leak into public/catalog/index-programs.*.json
  const catalogFiles = fs.readdirSync(path.join(ROOT, 'public/catalog'));
  const progIdxFile = catalogFiles.find((f) => /^index-programs\..+\.json$/.test(f));
  assert.ok(progIdxFile, 'Expected exported index-programs.*.json');
  const progIdx = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/catalog', progIdxFile), 'utf-8'));
  const quarantinedProgramIds = new Set(
    qArr.filter((r: any) => r.entityType === 'program').map((r: any) => String(r.entityId))
  );
  for (const pubProg of progIdx.programs || []) {
    assert.ok(!quarantinedProgramIds.has(String(pubProg.id)), `Quarantined program leaked into public index: ${pubProg.id}`);
  }
});

// ============================================================================
// 2. BUILD OUTPUT SECRET SCAN & SECURITY CONTROLS
// ============================================================================

test('Phase 8 Security: dist/ build output has zero leaked secrets, server hides X-Powered-By, legacy admin has zero GitHub merge authority', () => {
  const distFiles = walkFiles(path.join(ROOT, 'dist')).filter((f) => /\.(js|css|html|json)$/.test(f));
  assert.ok(distFiles.length > 50, 'Expected production build artifacts in dist/');

  for (const f of distFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    assert.ok(!/AIza[0-9A-Za-z_-]{35}/.test(content), `Potential Google API key in ${f}`);
    assert.ok(!/\bre_[A-Za-z0-9]{20,}/.test(content), `Potential Resend API key in ${f}`);
    assert.ok(!/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(content), `Private key PEM found in ${f}`);
    assert.ok(!/postgresql?:\/\/[^\s"']+/.test(content), `Database URI found in ${f}`);
  }

  const serverSrc = fs.readFileSync(path.join(ROOT, 'server.ts'), 'utf-8');
  assert.ok(serverSrc.includes("app.disable('x-powered-by')"), 'server.ts must disable X-Powered-By');
  // Legacy single-passphrase admin route must NEVER hold GitHub merge/push token authority
  assert.ok(!serverSrc.includes('GITHUB_TOKEN'), 'server.ts must not use GITHUB_TOKEN for legacy admin routes');
  assert.ok(!serverSrc.includes('api.github.com'), 'server.ts must not invoke GitHub merge APIs');

  const headers = getSecurityHeaders({ isApi: false, allowPreviewFraming: false });
  assert.ok(headers['Content-Security-Policy']);
  assert.ok(headers['Strict-Transport-Security']);
  assert.ok(headers['Permissions-Policy']);
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
});

// ============================================================================
// 3. GITHUB WORKFLOWS LEAST-PRIVILEGE & HUMAN-APPROVAL GATES
// ============================================================================

test('Phase 8 GitHub Readiness: workflows enforce least-privilege read defaults and never auto-merge legal updates', () => {
  const readOnlyWorkflows = [
    '.github/workflows/daily-source-monitoring.yml',
    '.github/workflows/editorial-pr-validation.yml',
    '.github/workflows/validate-and-regenerate-catalog.yml',
  ];
  for (const wf of readOnlyWorkflows) {
    const yml = fs.readFileSync(path.join(ROOT, wf), 'utf-8');
    assert.ok(/permissions:\s*\n\s*contents:\s*read/m.test(yml), `${wf} must restrict permissions to contents: read`);
    assert.ok(!/pull_request_target/.test(yml), `${wf} must never use pull_request_target`);
    assert.ok(!/gh pr merge/.test(yml), `${wf} must never auto-merge PRs`);
  }

  const proposeWf = fs.readFileSync(path.join(ROOT, '.github/workflows/propose-catalog-refresh-pr.yml'), 'utf-8');
  assert.ok(proposeWf.includes('workflow_dispatch:'), 'propose-catalog-refresh-pr.yml must require workflow_dispatch');
  assert.ok(!/gh pr merge/.test(proposeWf), 'propose-catalog-refresh-pr.yml must NEVER auto-merge PRs');
  assert.ok(!/pull_request_target/.test(proposeWf), 'propose-catalog-refresh-pr.yml must never use pull_request_target');
});

// ============================================================================
// 4. CANDIDATE SITEMAP RESOLUTION & STRICT SAFETY INVARIANTS
// ============================================================================

test('Phase 8 Sitemap & Safety: every candidate sitemap URL resolves cleanly, legacy sitemaps/robots/DBs untouched', () => {
  const staticDir = path.join(ROOT, 'public/sitemaps-static');
  const subFiles = [
    'sitemap-static-core.xml',
    'sitemap-static-countries.xml',
    'sitemap-static-programs.xml',
    'sitemap-static-routes.xml',
    'sitemap-static-editorial.xml',
  ];

  const allUrls: string[] = [];
  for (const sf of subFiles) {
    const xml = fs.readFileSync(path.join(staticDir, sf), 'utf-8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    allUrls.push(...locs);
  }
  assert.equal(allUrls.length, 56);
  assert.equal(new Set(allUrls).size, 56);

  // Every single URL in the candidate sitemaps must resolve via SSR route renderer to HTTP 200 & indexable
  for (const fullUrl of allUrls) {
    const parsed = new URL(fullUrl);
    const ssr = renderRouteSsrPayload(parsed.pathname);
    assert.equal(ssr.statusCode, 200, `Candidate sitemap URL did not resolve 200: ${fullUrl}`);
    assert.ok(!ssr.robots.includes('noindex'), `Candidate sitemap URL emitted noindex: ${fullUrl}`);
  }

  // Legacy sitemaps (89) + robots.txt + protected SQLite DBs/backup must remain untouched
  const legacySitemaps = fs.readdirSync(path.join(ROOT, 'public')).filter((f) => /^sitemap.*\.xml$/.test(f));
  assert.equal(legacySitemaps.length, 89);

  const robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf-8');
  assert.ok(robots.includes('Sitemap: https://www.visaapply.org/sitemap-index.xml'));
  assert.ok(!robots.includes('sitemaps-static'));

  assert.equal(
    sha256File('data_db/immigration_hub.db'),
    '936faacbb233ab114dc9e90393ff2aa93d7a3ff4ca5c2231de1cf1d2f48820d4'
  );
  assert.equal(
    sha256File('data_db/immigration_hub.db-wal'),
    '72698faadb3e0d3e8b9525222fd544a82b37fd2ccb13940b64676e87856be09f'
  );
  assert.equal(
    sha256File('data_db/immigration_hub.db-shm'),
    '70d1f2ac7d8a9a06c39f06e8b5ced61b1f9fd9a6d3cccd28a223713bbfcd6b7f'
  );
  assert.equal(
    sha256File('backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db'),
    '827494c04201f9ea4adcd7530566f41e9c7f091c1507b59abd95b1d8d7fb4e03'
  );
});
