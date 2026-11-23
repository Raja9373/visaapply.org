import fs from 'node:fs';
import path from 'node:path';
import { verifySqliteMockPostgresParity } from '../src/db/phaseB3ParityVerifier';

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

  if (!sourceArg) {
    console.error(
      'Usage: npx tsx scripts/verifySqliteNeonParity.ts --source <verified-backup-dir|archive.tar.gz> [--manifest <backup_manifest.json>] [--out <parity_report.json>]'
    );
    process.exit(1);
  }

  const report = await verifySqliteMockPostgresParity({
    sourcePath: path.resolve(sourceArg),
    manifestPath: manifestArg ? path.resolve(manifestArg) : undefined
  });

  const json = JSON.stringify(report, null, 2);
  if (outArg) {
    const outPath = path.resolve(outArg);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, json, 'utf-8');
  }
  console.log(json);

  if (!report.passed) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Parity verification failed:', err?.message || err);
  process.exitCode = 1;
});
