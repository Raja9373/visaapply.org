import path from 'node:path';
import { createVerifiedBackup, verifyBackupRestore } from '../src/utils/backupManager';

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outArg = outIdx >= 0 ? args[outIdx + 1] : undefined;
  const allowOverwrite = args.includes('--overwrite');
  const skipVerify = args.includes('--skip-verify');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = outArg
    ? path.resolve(outArg)
    : path.resolve(process.cwd(), `backup_verified_${timestamp}.tar.gz`);

  const result = await createVerifiedBackup({
    outputPath,
    projectRoot: process.cwd(),
    allowOverwrite
  });

  console.log(
    JSON.stringify(
      {
        action: 'createVerifiedBackup',
        success: result.success,
        outputPath: path.basename(result.outputPath),
        archiveSizeBytes: result.archiveSizeBytes,
        archiveSha256: result.archiveSha256,
        totalFiles: result.manifest.totalFiles,
        databaseSnapshot: result.manifest.databaseSnapshot
      },
      null,
      2
    )
  );

  if (!skipVerify) {
    const restoreReport = verifyBackupRestore(result.outputPath);
    console.log(JSON.stringify({ action: 'verifyBackupRestore', ...restoreReport }, null, 2));
    if (!restoreReport.success) {
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error('Backup failed:', err?.message || err);
  process.exitCode = 1;
});
