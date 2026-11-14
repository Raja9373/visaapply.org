import path from 'node:path';
import { verifyBackupRestore } from '../src/utils/backupManager';

function main() {
  const args = process.argv.slice(2);
  const archIdx = args.indexOf('--archive');
  const archiveArg = archIdx >= 0 ? args[archIdx + 1] : args[0];

  if (!archiveArg) {
    console.error('Usage: npx tsx scripts/verifyBackupRestore.ts --archive <path-to-backup.tar.gz>');
    process.exit(1);
  }

  const report = verifyBackupRestore(path.resolve(archiveArg));
  console.log(JSON.stringify(report, null, 2));
  if (!report.success) {
    process.exitCode = 1;
  }
}

main();
