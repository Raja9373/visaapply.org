import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createVerifiedBackup, verifyBackupRestore } from '../src/utils/backupManager';

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const dirIdx = args.indexOf('--dir');
  const outArg = outIdx >= 0 ? args[outIdx + 1] : undefined;
  const dirArg = dirIdx >= 0 ? args[dirIdx + 1] : undefined;
  const allowOverwrite = args.includes('--overwrite');
  const skipVerify = args.includes('--skip-verify');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const uniqueSuffix = crypto.randomBytes(2).toString('hex');

  let outputPath: string;
  let manifestOutputPath: string;
  let standaloneDbOutputPath: string | undefined;

  if (outArg) {
    outputPath = path.resolve(outArg);
    const parentDir = path.dirname(outputPath);
    manifestOutputPath = path.join(parentDir, 'backup_manifest.json');
  } else {
    const backupDir = dirArg
      ? path.resolve(dirArg)
      : path.resolve(process.cwd(), 'backups', `phase_b3_verified_${timestamp}_${uniqueSuffix}`);
    if (!allowOverwrite && fs.existsSync(backupDir)) {
      throw new Error(`EEXIST: Backup directory already exists: ${backupDir}`);
    }
    fs.mkdirSync(backupDir, { recursive: true });
    outputPath = path.join(backupDir, 'visaapply_backup.tar.gz');
    manifestOutputPath = path.join(backupDir, 'backup_manifest.json');
    standaloneDbOutputPath = path.join(backupDir, 'immigration_hub_standalone.db');
  }

  const result = await createVerifiedBackup({
    outputPath,
    manifestOutputPath,
    standaloneDbOutputPath,
    projectRoot: process.cwd(),
    allowOverwrite
  });

  console.log(
    JSON.stringify(
      {
        action: 'createVerifiedBackup',
        success: result.success,
        backupDirectory: path.relative(process.cwd(), path.dirname(result.outputPath)),
        outputPath: path.relative(process.cwd(), result.outputPath),
        manifestPath: result.manifestPath ? path.relative(process.cwd(), result.manifestPath) : null,
        standaloneDbPath: result.standaloneDbPath
          ? path.relative(process.cwd(), result.standaloneDbPath)
          : null,
        archiveSizeBytes: result.archiveSizeBytes,
        archiveSha256: result.archiveSha256,
        totalFiles: result.manifest.totalFiles,
        databaseSnapshot: result.manifest.databaseSnapshot,
        nonSqliteInventory: result.manifest.nonSqliteInventory
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
