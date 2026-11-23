import fs from 'node:fs';
import path from 'node:path';
import { planAndOptionallyApplyMockMigration } from '../src/db/phaseB3MigrationEngine';

function getArgValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const sourceArg = getArgValue(args, '--source');
  const manifestArg = getArgValue(args, '--manifest');
  const outArg = getArgValue(args, '--out');
  const verifyOnly = args.includes('--verify-only');
  const execute = args.includes('--execute');
  const applyMock = args.includes('--apply-mock');
  // Dry-run is ALWAYS the default
  const dryRun = !applyMock || args.includes('--dry-run');

  if (!sourceArg) {
    console.error(
      'Usage: npx tsx scripts/migrateSqliteToNeon.ts --source <verified-backup-dir|archive.tar.gz> [--manifest <backup_manifest.json>] [--dry-run] [--verify-only] [--out <plan.json>]'
    );
    process.exit(1);
  }

  const report = await planAndOptionallyApplyMockMigration({
    sourcePath: path.resolve(sourceArg),
    manifestPath: manifestArg ? path.resolve(manifestArg) : undefined,
    dryRun,
    verifyOnly,
    execute,
    applyToMock: applyMock && !verifyOnly && !args.includes('--dry-run')
  });

  const json = JSON.stringify(report, null, 2);
  if (outArg) {
    const outPath = path.resolve(outArg);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, json, 'utf-8');
  }
  console.log(json);

  if (report.totals.conflicts > 0 || report.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Migration engine error:', err?.message || err);
  process.exitCode = 1;
});
