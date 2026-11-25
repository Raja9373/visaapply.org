/**
 * VISAAPPLY.ORG — PHASE 6.1 AUTOMATED VERIFICATION TESTS
 * GitHub Repository Security Activation, CODEOWNERS Hardening & Workflow Invariants
 *
 * Clearly distinguished as LOCAL verification tests (live GitHub remote settings,
 * branch protection, org teams, and 2FA require manual repository administrator setup).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  REQUIRED_PR_STATUS_CHECK_NAME,
  parseCodeowners,
  verifyGithubGovernanceConfig
} from '../scripts/verifyGithubGovernanceConfig';

const ROOT_DIR = process.cwd();

test('Phase 6.1 (1): Live repository CODEOWNERS, role-policy.json, PR template & workflows pass strict security audit', () => {
  const report = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR });
  assert.equal(report.valid, true, `Expected clean local governance audit, got errors: ${report.errors.join('; ')}`);
  assert.equal(report.requiredStatusCheckName, REQUIRED_PR_STATUS_CHECK_NAME);
  assert.ok(report.codeownersRulesCount >= 24, `Expected comprehensive CODEOWNERS rules, got ${report.codeownersRulesCount}`);

  // Confirm READ_ONLY_AUDITOR is never listed as a CODEOWNER
  assert.equal(
    report.codeownersTeamsReferenced.includes('@visaapply-org/read-only-auditors'),
    false,
    'Read-only auditors must never be listed as CODEOWNERS'
  );
});

test('Phase 6.1 (2): CODEOWNERS audit catches OR privilege bypasses, missing fallback, unknown teams & READ_ONLY_AUDITOR', () => {
  const realCodeowners = fs.readFileSync(path.join(ROOT_DIR, '.github/CODEOWNERS'), 'utf8');

  // A. Logical-OR bypass: putting country-editors on high-risk /data/programs/ MUST fail
  const orBypass = realCodeowners.replace(
    '/data/programs/                       @visaapply-org/senior-immigration-reviewers @visaapply-org/platform-admins',
    '/data/programs/                       @visaapply-org/senior-immigration-reviewers @visaapply-org/country-editors'
  );
  const resOr = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR, codeownersContent: orBypass });
  assert.equal(resOr.valid, false);
  assert.ok(resOr.errors.some((e) => e.includes('CODEOWNERS_OR_PRIVILEGE_GAP')));

  // B. Unknown / nonexistent team MUST fail
  const unknownTeam = `${realCodeowners}\n/docs/ @visaapply-org/nonexistent-team\n`;
  const resUnknown = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR, codeownersContent: unknownTeam });
  assert.equal(resUnknown.valid, false);
  assert.ok(resUnknown.errors.some((e) => e.includes('CODEOWNERS_UNKNOWN_TEAM')));

  // C. Listing READ_ONLY_AUDITOR in CODEOWNERS MUST fail
  const readOnlyOwner = `${realCodeowners}\n/docs/ @visaapply-org/read-only-auditors\n`;
  const resReadOnly = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR, codeownersContent: readOnlyOwner });
  assert.equal(resReadOnly.valid, false);
  assert.ok(resReadOnly.errors.some((e) => e.includes('CODEOWNERS_READ_ONLY_FORBIDDEN')));

  // D. Removing default catch-all `*` rule MUST fail
  const noFallback = realCodeowners.replace(/^\*\s+.*$/m, '');
  const resNoFallback = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR, codeownersContent: noFallback });
  assert.equal(resNoFallback.valid, false);
  assert.ok(resNoFallback.errors.some((e) => e.includes('CODEOWNERS_MISSING_INFRA_RULE')));
});

test('Phase 6.1 (3): Editorial PR workflow audit rejects paths deadlock, write perms, secrets access & shell interpolation', () => {
  const realWorkflow = fs.readFileSync(
    path.join(ROOT_DIR, '.github/workflows/editorial-pr-validation.yml'),
    'utf8'
  );

  // A. Reintroducing `paths:` filter breaks Required Status Check on docs-only PRs -> MUST fail
  const withPaths = realWorkflow.replace('    branches:\n      - main', '    branches:\n      - main\n    paths:\n      - "data/**"');
  const resPaths = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR, prWorkflowContent: withPaths });
  assert.equal(resPaths.valid, false);
  assert.ok(resPaths.errors.some((e) => e.includes('PR_WORKFLOW_PATHS_DEADLOCK')));

  // B. Requesting write permissions on untrusted PR workflow MUST fail
  const withWrite = realWorkflow.replace('contents: read', 'contents: write');
  const resWrite = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR, prWorkflowContent: withWrite });
  assert.equal(resWrite.valid, false);
  assert.ok(resWrite.errors.some((e) => e.includes('PR_WORKFLOW_WRITE_FORBIDDEN')));

  // C. Referencing secrets.* inside untrusted PR workflow MUST fail
  const withSecrets = `${realWorkflow}\n      - name: Bad\n        env:\n          TOK: \${{ secrets.SOME_TOKEN }}\n        run: echo ok\n`;
  const resSecrets = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR, prWorkflowContent: withSecrets });
  assert.equal(resSecrets.valid, false);
  assert.ok(resSecrets.errors.some((e) => e.includes('PR_WORKFLOW_SECRETS_FORBIDDEN')));

  // D. Direct `${{ github.base_ref }}` inside a `run:` command MUST fail
  const withInjection = realWorkflow.replace(
    'git show "origin/${BASE_REF}:data/editorial-governance/audit-log.json"',
    'git show "origin/${{ github.base_ref }}:data/editorial-governance/audit-log.json"'
  );
  const resInj = verifyGithubGovernanceConfig({ rootDir: ROOT_DIR, prWorkflowContent: withInjection });
  assert.equal(resInj.valid, false);
  assert.ok(resInj.errors.some((e) => e.includes('PR_WORKFLOW_EXPRESSION_INJECTION')));
});

test('Phase 6.1 (4): CODEOWNERS syntax parser validates clean structure and catches malformed handles', () => {
  const parsed = parseCodeowners('/data/programs/ @visaapply-org/senior-immigration-reviewers\n/bad/ not-a-handle\n/lonely/');
  assert.equal(parsed.rules.length, 2);
  assert.equal(parsed.syntaxErrors.length, 2);
  assert.ok(parsed.syntaxErrors[0].includes('invalid GitHub owner handle'));
  assert.ok(parsed.syntaxErrors[1].includes('missing owner'));
});
