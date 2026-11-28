import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const WORKFLOWS_DIR = path.join(ROOT, '.github/workflows');

const EXPECTED_WORKFLOWS = [
  'daily-source-monitoring.yml',
  'editorial-pr-validation.yml',
  'preview-staging-validation.yml',
  'propose-catalog-refresh-pr.yml',
  'validate-and-regenerate-catalog.yml',
] as const;

test('1. All 5 GitHub Actions workflows exist and are lockfile-safe when package-lock.json is absent', () => {
  const actualFiles = fs.readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml')).sort();
  assert.deepEqual(actualFiles, [...EXPECTED_WORKFLOWS]);

  const hasPackageLock = fs.existsSync(path.join(ROOT, 'package-lock.json'));
  for (const filename of EXPECTED_WORKFLOWS) {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, filename), 'utf8');
    assert.ok(/^name:\s+.+/m.test(content), `${filename} must define a workflow name`);
    assert.ok(/^jobs:\s*$/m.test(content), `${filename} must define jobs`);

    if (!hasPackageLock) {
      assert.equal(
        /cache:\s*['"]?npm['"]?/.test(content),
        false,
        `${filename} must not set setup-node cache: 'npm' while package-lock.json is absent`
      );
      assert.equal(
        /^\s*run:\s*npm ci\s*$/m.test(content),
        false,
        `${filename} must not run bare 'npm ci' without a package-lock.json fallback`
      );
      assert.ok(
        content.includes('if [ -f package-lock.json ]; then'),
        `${filename} must use lockfile-safe dependency installation`
      );
    }
  }
});

test('2. preview-staging-validation.yml handles visaapply-staging -> main PRs safely with zero secrets, read-only permissions, and no production deploy', () => {
  const wf = fs.readFileSync(path.join(WORKFLOWS_DIR, 'preview-staging-validation.yml'), 'utf8');
  assert.ok(wf.includes('- visaapply-staging'));
  assert.ok(wf.includes('- main'));
  assert.ok(
    wf.includes("github.head_ref == 'visaapply-staging'"),
    'Must run when PR head_ref is visaapply-staging (visaapply-staging -> main)'
  );
  assert.ok(
    wf.includes("github.base_ref == 'visaapply-staging'"),
    'Must run when PR base_ref is visaapply-staging (feature -> visaapply-staging)'
  );
  assert.ok(wf.includes('contents: read'));
  assert.ok(wf.includes('cancel-in-progress: true'));
  assert.equal(/secrets\./.test(wf), false, 'Must not reference secrets.*');
  assert.equal(/:\s*write\b/.test(wf), false, 'Must not request write permissions');
  assert.equal(/vercel\s+--prod|vercel\s+deploy/i.test(wf), false, 'Must never deploy to Vercel');
  assert.equal(/prisma|drizzle|migrate|psql|sqlite3/i.test(wf), false, 'Must never mutate databases');
});
