import fs from 'node:fs';
import path from 'node:path';
import { verifyBackupRestore } from '../src/utils/backupManager';

function resolveArchivePath(args: string[]): string | null {
  const archIdx = args.indexOf('--archive');
  if (archIdx >= 0 && args[archIdx + 1]) {
    return path.resolve(args[archIdx + 1]);
  }
  const dirIdx = args.indexOf('--backup-dir');
  if (dirIdx >= 0 && args[dirIdx + 1]) {
    const dir = path.resolve(args[dirIdx + 1]);
    const candidate = path.join(dir, 'visaapply_backup.tar.gz');
    if (fs.existsSync(candidate)) return candidate;
    const tarFile = fs.existsSync(dir)
      ? fs.readdirSync(dir).find((f) => f.endsWith('.tar.gz'))
      : undefined;
    return tarFile ? path.join(dir, tarFile) : candidate;
  }
  if (args[0] && !args[0].startsWith('--')) {
    const p = path.resolve(args[0]);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      const candidate = path.join(p, 'visaapply_backup.tar.gz');
      if (fs.existsSync(candidate)) return candidate;
    }
    return p;
  }
  return null;
}

function main() {
  const args = process.argv.slice(2);
  const archivePath = resolveArchivePath(args);

  if (!archivePath) {
    console.error(
      'Usage: npx tsx scripts/verifyBackupRestore.ts --archive <path-to-backup.tar.gz> | --backup-dir <timestamped-backup-dir>'
    );
    process.exit(1);
  }

  const report = verifyBackupRestore(archivePath);
  console.log(JSON.stringify(report, null, 2));
  if (!report.success) {
    process.exitCode = 1;
  }
}

main();
