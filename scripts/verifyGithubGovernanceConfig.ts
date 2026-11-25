/**
 * VISAAPPLY.ORG — PHASE 6.1: GITHUB GOVERNANCE, CODEOWNERS & WORKFLOW VERIFIER
 *
 * Locally audits and validates repository-side GitHub security controls:
 * 1. `.github/CODEOWNERS` syntax, path existence, fallback `*` rule, team validity
 *    against `data/editorial-governance/role-policy.json` & `GITHUB_ROLE_TEAM_MAPPING`,
 *    exclusion of `READ_ONLY_AUDITOR`, and elimination of logical-OR approval gaps on
 *    high-risk immigration, quarantine, source-registry, public catalog, and CI paths.
 * 2. `.github/workflows/editorial-pr-validation.yml` trigger (`pull_request` on `main`,
 *    NO `paths:` filter so required checks never deadlock), minimal `contents: read`
 *    permissions, zero `secrets.*`, exact required status check name, and zero direct
 *    `${{ github.* }}` shell interpolation inside `run:` blocks.
 * 3. Companion `.github/workflows/*.yml` least-privilege boundaries.
 * 4. `.github/pull_request_template.md` mandatory evidence & 5-gate quarantine fields.
 *
 * IMPORTANT: Local validation does NOT prove GitHub remote repository settings
 * (branch protection, required CODEOWNERS review, org teams, 2FA) are active.
 * Live GitHub enforcement requires manual repository administration.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EDITORIAL_ROLE_PERMISSION_MATRIX,
  EDITORIAL_ROLES,
  GITHUB_ROLE_TEAM_MAPPING,
  type EditorialRole
} from '../src/schemas/editorialGovernanceSchemas';

export interface CodeownersRule {
  lineNumber: number;
  pattern: string;
  owners: string[];
}

export interface GithubGovernanceAuditReport {
  valid: boolean;
  checkedAt: string;
  requiredStatusCheckName: string;
  codeownersRulesCount: number;
  codeownersTeamsReferenced: string[];
  errors: string[];
  warnings: string[];
}

export const REQUIRED_PR_STATUS_CHECK_NAME =
  'Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build';

/**
 * Paths where ONLY Senior Immigration Reviewers and/or Platform Admins may satisfy
 * CODEOWNERS review. Because GitHub treats multiple owners on one line as logical OR,
 * listing Country Editors or Evidence Reviewers here would create a privilege-bypass gap.
 */
export const HIGH_RISK_CODEOWNER_PATHS: readonly string[] = [
  '/data/programs/',
  '/data/visa-details/',
  '/data/verification/',
  '/data/routes/',
  '/data/countries/',
  '/data/official-sources/',
  '/data/editorial-governance/',
  '/data/editorial/published/',
  '/data/changelog/',
  '/public/catalog/',
  '/src/schemas/'
];

export const ADMIN_ONLY_INFRA_PATHS: readonly string[] = [
  '*',
  '/scripts/',
  '/tests/',
  '/.github/',
  '/public/sitemaps-static/',
  '/public/sitemap*.xml',
  '/public/robots.txt',
  '/package.json',
  '/server.ts'
];

export function parseCodeowners(content: string): { rules: CodeownersRule[]; syntaxErrors: string[] } {
  const rules: CodeownersRule[] = [];
  const syntaxErrors: string[] = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((rawLine, idx) => {
    const lineNumber = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      syntaxErrors.push(`CODEOWNERS line ${lineNumber}: missing owner(s) for pattern "${parts[0]}".`);
      return;
    }

    const [pattern, ...owners] = parts;
    for (const owner of owners) {
      // Valid GitHub owner formats: @org/team-slug or @username
      if (!/^@[a-zA-Z0-9-]+(?:\/[a-zA-Z0-9_.-]+)?$/.test(owner)) {
        syntaxErrors.push(`CODEOWNERS line ${lineNumber}: invalid GitHub owner handle "${owner}".`);
      }
    }
    rules.push({ lineNumber, pattern, owners });
  });

  return { rules, syntaxErrors };
}

function checkCodeownersPathExists(rootDir: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern.includes('*')) {
    // Glob pattern: check parent directory exists
    const relDir = path.dirname(pattern.replace(/^\//, ''));
    return fs.existsSync(path.join(rootDir, relDir));
  }
  const rel = pattern.replace(/^\//, '').replace(/\/$/, '');
  return fs.existsSync(path.join(rootDir, rel));
}

export function verifyGithubGovernanceConfig(options: {
  rootDir?: string;
  codeownersContent?: string;
  prWorkflowContent?: string;
  prTemplateContent?: string;
  rolePolicyJson?: string;
} = {}): GithubGovernanceAuditReport {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const errors: string[] = [];
  const warnings: string[] = [];

  const codeownersPath = path.join(rootDir, '.github/CODEOWNERS');
  const prWorkflowPath = path.join(rootDir, '.github/workflows/editorial-pr-validation.yml');
  const prTemplatePath = path.join(rootDir, '.github/pull_request_template.md');
  const rolePolicyPath = path.join(rootDir, 'data/editorial-governance/role-policy.json');

  const codeownersContent =
    options.codeownersContent ??
    (fs.existsSync(codeownersPath) ? fs.readFileSync(codeownersPath, 'utf8') : null);
  const prWorkflowContent =
    options.prWorkflowContent ??
    (fs.existsSync(prWorkflowPath) ? fs.readFileSync(prWorkflowPath, 'utf8') : null);
  const prTemplateContent =
    options.prTemplateContent ??
    (fs.existsSync(prTemplatePath) ? fs.readFileSync(prTemplatePath, 'utf8') : null);
  const rolePolicyRaw =
    options.rolePolicyJson ??
    (fs.existsSync(rolePolicyPath) ? fs.readFileSync(rolePolicyPath, 'utf8') : null);

  // 1. Validate role-policy.json consistency with canonical TypeScript schema
  const knownTeams = new Set<string>(Object.values(GITHUB_ROLE_TEAM_MAPPING));
  const highRiskApprovedTeams = new Set<string>([
    GITHUB_ROLE_TEAM_MAPPING.ADMINISTRATOR,
    GITHUB_ROLE_TEAM_MAPPING.SENIOR_IMMIGRATION_REVIEWER
  ]);
  const adminTeam = GITHUB_ROLE_TEAM_MAPPING.ADMINISTRATOR;
  const readOnlyTeam = GITHUB_ROLE_TEAM_MAPPING.READ_ONLY_AUDITOR;

  if (!rolePolicyRaw) {
    errors.push('MISSING_ROLE_POLICY: data/editorial-governance/role-policy.json is missing.');
  } else {
    try {
      const parsed = JSON.parse(rolePolicyRaw) as {
        frontendRoleChecksAreAuthoritative?: boolean;
        roles?: Record<string, { githubTeam?: string; permissions?: string[] }>;
      };
      if (parsed.frontendRoleChecksAreAuthoritative !== false) {
        errors.push('ROLE_POLICY_SECURITY: frontendRoleChecksAreAuthoritative MUST be false.');
      }
      for (const role of EDITORIAL_ROLES) {
        const entry = parsed.roles?.[role];
        if (!entry) {
          errors.push(`ROLE_POLICY_MISSING_ROLE: Role "${role}" missing from role-policy.json.`);
          continue;
        }
        if (entry.githubTeam !== GITHUB_ROLE_TEAM_MAPPING[role as EditorialRole]) {
          errors.push(
            `ROLE_POLICY_TEAM_MISMATCH: Role "${role}" has "${entry.githubTeam}" in role-policy.json, expected "${GITHUB_ROLE_TEAM_MAPPING[role as EditorialRole]}".`
          );
        }
        const expectedPerms = [...EDITORIAL_ROLE_PERMISSION_MATRIX[role as EditorialRole]].sort();
        const actualPerms = [...(entry.permissions ?? [])].sort();
        if (JSON.stringify(expectedPerms) !== JSON.stringify(actualPerms)) {
          errors.push(
            `ROLE_POLICY_PERM_MISMATCH: Role "${role}" permissions in role-policy.json diverge from editorialGovernanceSchemas.ts.`
          );
        }
      }
    } catch (err) {
      errors.push(`ROLE_POLICY_INVALID_JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 2. Validate .github/CODEOWNERS
  const teamsReferenced = new Set<string>();
  let rulesCount = 0;

  if (!codeownersContent) {
    errors.push('MISSING_CODEOWNERS: .github/CODEOWNERS is missing.');
  } else {
    const { rules, syntaxErrors } = parseCodeowners(codeownersContent);
    errors.push(...syntaxErrors);
    rulesCount = rules.length;

    const ruleByPattern = new Map<string, CodeownersRule>();
    for (const rule of rules) {
      ruleByPattern.set(rule.pattern, rule);
      for (const owner of rule.owners) {
        teamsReferenced.add(owner);
        if (!knownTeams.has(owner)) {
          errors.push(
            `CODEOWNERS_UNKNOWN_TEAM: Line ${rule.lineNumber} references "${owner}", which is not mapped in role-policy.json.`
          );
        }
        if (owner === readOnlyTeam) {
          errors.push(
            `CODEOWNERS_READ_ONLY_FORBIDDEN: Line ${rule.lineNumber} lists READ_ONLY_AUDITOR team "${readOnlyTeam}" as an approver.`
          );
        }
      }

      if (!checkCodeownersPathExists(rootDir, rule.pattern)) {
        errors.push(
          `CODEOWNERS_MISSING_PATH: Line ${rule.lineNumber} pattern "${rule.pattern}" does not match an existing path in the repository.`
        );
      }
    }

    // Check high-risk paths strictly require Senior Immigration Reviewers or Platform Admins (no OR-bypass!)
    for (const reqPath of HIGH_RISK_CODEOWNER_PATHS) {
      const rule = ruleByPattern.get(reqPath);
      if (!rule) {
        errors.push(`CODEOWNERS_MISSING_HIGH_RISK_RULE: Required high-risk path "${reqPath}" has no explicit CODEOWNERS entry.`);
        continue;
      }
      const unauthorizedOwners = rule.owners.filter((o) => !highRiskApprovedTeams.has(o));
      if (unauthorizedOwners.length > 0) {
        errors.push(
          `CODEOWNERS_OR_PRIVILEGE_GAP: High-risk path "${reqPath}" includes lower-privilege owner(s) [${unauthorizedOwners.join(', ')}] which could bypass Senior Reviewer approval via GitHub OR semantics.`
        );
      }
      if (!rule.owners.includes(GITHUB_ROLE_TEAM_MAPPING.SENIOR_IMMIGRATION_REVIEWER)) {
        errors.push(
          `CODEOWNERS_MISSING_SENIOR_REVIEWER: High-risk path "${reqPath}" must include "${GITHUB_ROLE_TEAM_MAPPING.SENIOR_IMMIGRATION_REVIEWER}".`
        );
      }
    }

    // Check admin-only infrastructure, CI, tests, fallback & sitemap paths
    for (const adminPath of ADMIN_ONLY_INFRA_PATHS) {
      const rule = ruleByPattern.get(adminPath);
      if (!rule) {
        errors.push(`CODEOWNERS_MISSING_INFRA_RULE: Critical path "${adminPath}" has no explicit CODEOWNERS entry.`);
        continue;
      }
      const nonAdminOwners = rule.owners.filter((o) => o !== adminTeam);
      if (nonAdminOwners.length > 0) {
        errors.push(
          `CODEOWNERS_INFRA_PRIVILEGE_GAP: Infrastructure path "${adminPath}" must be owned exclusively by "${adminTeam}" (found: ${nonAdminOwners.join(', ')}).`
        );
      }
    }

    warnings.push(
      'EXTERNAL_ORG_CHECK_PENDING: Confirm the GitHub Organization slug matches "@visaapply-org/*" (or update to your live GitHub Org slug) and that every listed team exists with explicit Write/Maintain/Admin repository access.'
    );
  }

  // 3. Validate .github/workflows/editorial-pr-validation.yml
  if (!prWorkflowContent) {
    errors.push('MISSING_PR_WORKFLOW: .github/workflows/editorial-pr-validation.yml is missing.');
  } else {
    const activeLines = prWorkflowContent
      .split(/\r?\n/)
      .filter((l) => !l.trim().startsWith('#'))
      .join('\n');

    if (!/^\s*pull_request:\s*$/m.test(activeLines)) {
      errors.push('PR_WORKFLOW_TRIGGER: editorial-pr-validation.yml must trigger on standard `pull_request:`.');
    }
    if (prWorkflowContent.includes('pull_request_target')) {
      errors.push('PR_WORKFLOW_UNSAFE_TRIGGER: editorial-pr-validation.yml must NEVER use untrusted PR target execution.');
    }
    if (/^\s*paths:\s*$/m.test(activeLines)) {
      errors.push(
        'PR_WORKFLOW_PATHS_DEADLOCK: editorial-pr-validation.yml must NOT define a `paths:` filter because a Required Status Check with `paths:` deadlocks non-matching PRs (e.g., docs-only test PRs) and lets src/tests/public PRs skip validation.'
      );
    }
    if (!/permissions:\s*\n\s*contents:\s*read\b/.test(activeLines)) {
      errors.push('PR_WORKFLOW_PERMISSIONS: editorial-pr-validation.yml must enforce `permissions: { contents: read }`.');
    }
    if (/\b(?:contents|pull-requests|issues|packages|deployments|id-token):\s*write\b/.test(activeLines)) {
      errors.push('PR_WORKFLOW_WRITE_FORBIDDEN: Untrusted PR validation workflow must not request write permissions.');
    }
    if (activeLines.includes('secrets.')) {
      errors.push('PR_WORKFLOW_SECRETS_FORBIDDEN: Untrusted PR validation workflow must never reference `secrets.*`.');
    }
    if (!activeLines.includes(`name: ${REQUIRED_PR_STATUS_CHECK_NAME}`)) {
      errors.push(
        `PR_WORKFLOW_STATUS_CHECK_NAME: Expected exact required status check job name "${REQUIRED_PR_STATUS_CHECK_NAME}".`
      );
    }
    if (!activeLines.includes('scripts/validateEditorialPullRequest.ts')) {
      errors.push('PR_WORKFLOW_MISSING_VALIDATOR: Workflow must execute scripts/validateEditorialPullRequest.ts.');
    }
    if (!activeLines.includes('editorial:verify-github-config')) {
      errors.push('PR_WORKFLOW_MISSING_CONFIG_CHECK: Workflow must execute npm run editorial:verify-github-config.');
    }
    // Check against shell expression injection inside actual `run:` command lines (not `env:` mappings)
    const wfLines = activeLines.split(/\r?\n/);
    let inRunBlock = false;
    let runBlockIndent = 0;
    let hasRunGithubInterpolation = false;
    for (const line of wfLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const indent = line.length - line.trimStart().length;
      if (inRunBlock) {
        if (indent > runBlockIndent) {
          if (/\$\{\{\s*github\./.test(line)) {
            hasRunGithubInterpolation = true;
            break;
          }
          continue;
        }
        inRunBlock = false;
      }
      const runMatch = /^(\s*)run:\s*(.*)$/.exec(line);
      if (runMatch) {
        const rest = runMatch[2].trim();
        if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') {
          inRunBlock = true;
          runBlockIndent = runMatch[1].length;
        } else if (/\$\{\{\s*github\./.test(rest)) {
          hasRunGithubInterpolation = true;
          break;
        }
      }
    }
    if (hasRunGithubInterpolation) {
      errors.push(
        'PR_WORKFLOW_EXPRESSION_INJECTION: Pass `${{ github.* }}` values via `env:` instead of interpolating them directly inside `run:` shell commands.'
      );
    }
  }

  // 4. Validate .github/pull_request_template.md
  if (!prTemplateContent) {
    errors.push('MISSING_PR_TEMPLATE: .github/pull_request_template.md is missing.');
  } else {
    for (const token of [
      'LOW_RISK',
      'HIGH_RISK',
      'Official Source ID',
      'Official HTTPS Government URL',
      'Gate 1',
      'Gate 5',
      'No AI-only approval',
      'audit-log.json'
    ]) {
      if (!prTemplateContent.includes(token)) {
        errors.push(`PR_TEMPLATE_MISSING_FIELD: .github/pull_request_template.md is missing mandatory section/phrase "${token}".`);
      }
    }
  }

  // 5. Companion workflow least-privilege checks (read from disk if present)
  const dailyMonPath = path.join(rootDir, '.github/workflows/daily-source-monitoring.yml');
  if (fs.existsSync(dailyMonPath)) {
    const wf = fs.readFileSync(dailyMonPath, 'utf8');
    if (/\bcontents:\s*write\b/.test(wf)) {
      errors.push('DAILY_MONITOR_WRITE_FORBIDDEN: daily-source-monitoring.yml must stay read-only (`contents: read`).');
    }
  }

  const refreshPrPath = path.join(rootDir, '.github/workflows/propose-catalog-refresh-pr.yml');
  if (fs.existsSync(refreshPrPath)) {
    const wf = fs.readFileSync(refreshPrPath, 'utf8');
    if (/^\s*pull_request/m.test(wf)) {
      errors.push('REFRESH_PR_TRIGGER_FORBIDDEN: propose-catalog-refresh-pr.yml has write permissions and must NEVER trigger on pull_request.');
    }
    if (/gh\s+pr\s+merge\b/.test(wf)) {
      errors.push('REFRESH_PR_AUTO_MERGE_FORBIDDEN: propose-catalog-refresh-pr.yml must NEVER auto-merge Pull Requests.');
    }
  }

  return {
    valid: errors.length === 0,
    checkedAt: new Date().toISOString(),
    requiredStatusCheckName: REQUIRED_PR_STATUS_CHECK_NAME,
    codeownersRulesCount: rulesCount,
    codeownersTeamsReferenced: [...teamsReferenced].sort(),
    errors,
    warnings
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const report = verifyGithubGovernanceConfig();
  console.log('===============================================================');
  console.log(
    report.valid
      ? '✅ GITHUB CODEOWNERS, ROLE-POLICY & WORKFLOW CONFIG VALIDATED (LOCAL)'
      : '❌ GITHUB GOVERNANCE CONFIG VALIDATION FAILED'
  );
  console.log(`- Required Status Check:   ${report.requiredStatusCheckName}`);
  console.log(`- CODEOWNERS Rules:        ${report.codeownersRulesCount}`);
  console.log(`- Teams Referenced:        ${report.codeownersTeamsReferenced.join(', ')}`);
  if (report.warnings.length > 0) {
    console.log('\nExternal Verification Reminders (Manual GitHub Setup Required):');
    for (const w of report.warnings) console.log(`  - ${w}`);
  }
  if (report.errors.length > 0) {
    console.log('\nBlocking Errors:');
    for (const e of report.errors) console.log(`  - ${e}`);
  }
  console.log('===============================================================');
  process.exit(report.valid ? 0 : 1);
}
