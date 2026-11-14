# VisaApply.org — Data Recovery & Operational Incident Runbook (Phase 4.4)

This runbook governs operational recovery, fail-closed containment, database restoration, and human-in-the-loop verification across VisaApply.org.

**Strict Rules:**
- Never embed secrets, credentials, passwords, or database DSNs in runbook commands or logs; inject credentials solely via environment secret managers.
- Never overwrite production `data_db/immigration_hub.db` directly without first creating a verified pre-recovery snapshot and performing an isolated temporary directory restore test.
- Never auto-publish automated extraction candidates without mandatory human review (`PENDING_HUMAN_REVIEW`).

---

## Scenario 1: Database Corruption (SQLite / WAL Corruption)

1. **Detection Method:**
   - `auditSqliteDatabaseIntegrity()` reports `integrity_check !== ["ok"]`, `foreignKeyViolations > 0`, or SQLite throws `SQLITE_CORRUPT`.
   - `/api/admin/operational-health` reports `sqlite_database: FAIL`.
2. **Immediate Containment:**
   - Halt scheduled cron execution and admin write endpoints (put application into read-only maintenance mode or deny `POST/DELETE` admin mutations).
   - Preserve the corrupted `data_db/immigration_hub.db`, `-wal`, and `-shm` files intact by copying them to an isolated forensic quarantine directory in `/tmp`.
3. **Safe Recovery Steps:**
   - Locate the latest verified backup archive (`backup_post_phase_4_4.tar.gz` or newer verified archive).
   - Run isolated restore verification first:
     `npx tsx scripts/verifyBackupRestore.ts --archive <verified-archive.tar.gz>`
   - Extract the verified archive into an isolated staging directory, confirm SHA-256 checksums match `backup_manifest.json`, and run `PRAGMA integrity_check` on the staged `.db` before promoting it to replace the damaged file.
4. **Data-Integrity Verification:**
   - Re-run `auditSqliteDatabaseIntegrity()` on the restored copy: confirm `integrityCheck: ["ok"]`, `foreignKeyViolations: 0`, zero duplicate `program_id` rows, zero orphans, and matching expected table row counts (`immigration_programs`, `visa_details`, `visa_detail_claims`, `visa_detail_evidence`, `visa_detail_versions`, `schema_migrations`).
   - Run `detectUnexpectedCountDelta()` against pre-incident counts.
5. **Required Human Approval:**
   - Senior engineering owner + data steward sign-off required before swapping the verified staging DB into production storage and re-enabling write traffic.
6. **Post-Recovery Audit:**
   - Record incident root cause, recovery timestamp, restored archive SHA-256, and verified row-count delta in operational incident log; verify next scheduled `30 21 * * *` cron execution completes cleanly.

---

## Scenario 2: Failed Schema Migration (SQLite or PostgreSQL)

1. **Detection Method:**
   - `runTrackedSqliteMigrations()` or `PostgresImmigrationRepository.runTrackedMigrations()` throws an error or `MIGRATION_CHECKSUM_MISMATCH`.
   - Operational telemetry records `MIGRATION_EVENT` / `DB_CONNECTION_ERROR` with `FAIL`.
2. **Immediate Containment:**
   - Migration runner executes each migration inside a database transaction (`BEGIN ... COMMIT` / SQLite `db.transaction()`), automatically rolling back partial DDL/DML on error.
   - Abort deployment or boot sequence immediately; do NOT run unvalidated manual `ALTER TABLE` commands against production.
3. **Safe Recovery Steps:**
   - Inspect `schema_migrations` table to confirm exact last successfully applied version and checksum.
   - Verify no partial table/column drift exists on an isolated clone of the database; if checksum mismatch occurred because an already-applied migration was edited, revert the edit and author a new additive migration (`004_...`).
   - If pre-migration backup exists and schema state is inconsistent, test restoration of the pre-migration backup into an isolated temp directory first.
4. **Data-Integrity Verification:**
   - Confirm `schema_migrations` versions and SHA-256 checksums match codebase `SQLITE_MIGRATIONS` / `POSTGRES_MIGRATIONS` definitions.
   - Re-run `auditSqliteDatabaseIntegrity()` and full regression tests against an isolated copy.
5. **Required Human Approval:**
   - Database architect review and approval of the corrected migration script and rollback notes before re-running migration.
6. **Post-Recovery Audit:**
   - Document migration failure cause, verify CI migration idempotency tests pass on re-run, and archive the pre-migration verified backup.

---

## Scenario 3: Incomplete Update Job (Mid-Run Timeout or Crash)

1. **Detection Method:**
   - `automation_checkpoints` contains status `IN_PROGRESS` or `PARTIAL_FAILED` with stale `updated_at`, or `cron_execution_logs` lacks a completion record for the latest `runId`.
2. **Immediate Containment:**
   - Wait for active lock TTL expiry or inspect `automation_job_locks`; verify the previous worker process is no longer executing before releasing a stale lock.
   - Confirmed already-completed items remain recorded in `completed_keys_json` and `idempotency_keys_json`.
3. **Safe Recovery Steps:**
   - Re-trigger the checkpointed pipeline using the same `checkpointId`: `runCheckpointedAutomationJob()` automatically skips `completedKeys` / `idempotencyKeys` and processes only remaining uncompleted or failed keys.
   - Review any items moved to `automation_dead_letter` (`QUARANTINED`) for transient vs permanent issues.
4. **Data-Integrity Verification:**
   - Confirm zero duplicate draft files, zero duplicate changelog entries, and accurate `completedCount + skippedCount + failedCount === totalItems`.
   - Confirm previously verified public records remained unaltered during the interrupted run.
5. **Required Human Approval:**
   - On-call engineer approves manual resume trigger when re-running outside the scheduled `30 21 * * *` window.
6. **Post-Recovery Audit:**
   - Verify checkpoint reached `COMPLETED` (or `PARTIAL_FAILED` with explicit DLQ triage items) and adjust per-request timeouts if upstream latency caused the interruption.

---

## Scenario 4: Duplicate Job Execution (Overlapping Cron or Manual Triggers)

1. **Detection Method:**
   - Pipeline returns `DUPLICATE_IN_PROGRESS` (HTTP `409`/`429`) or operational events log overlapping lock contention on `automation_job_locks` / `FileJobLockStore`.
2. **Immediate Containment:**
   - Lock manager (`acquireJobLock` / `FileJobLockStore`) rejects the second execution fail-closed while the active owner holds an unexpired lease.
   - Verify whether any concurrent bypass occurred (check `cron_execution_logs` for closely spaced runs and `content/drafts` for duplicate candidate files).
3. **Safe Recovery Steps:**
   - Allow the legitimate lock holder to finish cleanly and release the lock in `finally`.
   - If duplicate draft slugs were generated prior to lock enforcement, deduplicate pending unapproved files in `content/drafts` while preserving verified published content.
4. **Data-Integrity Verification:**
   - Check `idempotency_keys_json` in `automation_checkpoints` and verify published routes/counts match expected totals without double-counting.
5. **Required Human Approval:**
   - Engineering lead signs off before manually clearing any stuck lock or pruning duplicate draft files.
6. **Post-Recovery Audit:**
   - Confirm Vercel cron schedule in `vercel.json` remains strictly `30 21 * * *` with no duplicate scheduler triggers.

---

## Scenario 5: Failed Official-Source Retrieval (Timeout, HTTP 429/5xx, DNS/TLS Failure)

1. **Detection Method:**
   - `SOURCE_RETRIEVAL_FAILURE` event logged; `/api/cron/immigration-sync` returns HTTP `502` with `status: "QUARANTINED_FETCH_FAILED"`, `autoPublished: false`.
3. **Immediate Containment:**
   - Fail-closed gate preserves all existing verified records (`AVAILABLE_VERIFIED` / `NOT_AVAILABLE_CONFIRMED`) unchanged; NEVER flips failed fetches to unavailable or verified.
4. **Safe Recovery Steps:**
   - Inspect `automation_dead_letter` and `cron_execution_logs` for the classified `failureClass` (`TIMEOUT`, `NETWORK_ERROR`, `QUOTA_EXHAUSTED`, `SOURCE_UNAVAILABLE`).
   - Verify the sovereign portal URL in `OFFICIAL_SOURCE_REGISTRY_249` in a browser/CLI check for domain changes or temporary maintenance.
   - Retry bounded extraction manually once the official source responds HTTP 200 with substantive HTML text.
5. **Data-Integrity Verification:**
   - Confirm existing public API `/api/visa-details/:programId` and SSR route output continue serving the last verified snapshot cleanly without degradation or fabricated text.
6. **Required Human Approval:**
   - If a government portal permanently migrated domains, immigration legal-data reviewer must approve updating `OFFICIAL_SOURCE_REGISTRY_249` with HTTPS verification.
7. **Post-Recovery Audit:**
   - Resolve the `automation_dead_letter` entry once source retrieval succeeds and record updated check timestamp.

---

## Scenario 6: Incorrectly Staged Record (Malformatted AI Extraction or Expired Evidence)

1. **Detection Method:**
   - `evaluateSourceExtractionCandidate()` classifies item as `NEEDS_REVIEW` or `QUARANTINED_EXPIRED`, OR human reviewer flags factual/legal discrepancy in `content/drafts/*.md`.
2. **Immediate Containment:**
   - Keep record in `PENDING_HUMAN_REVIEW` / `QUARANTINED` (`autoPublished: false`); do NOT approve via `/api/admin/approve`.
3. **Safe Recovery Steps:**
   - Delete or amend the staged draft file via `DELETE /api/admin/drafts/:slug` or admin claim editor (`POST /api/admin/visa-details/:programId/claims`).
   - Attach corrected primary official source URL, legal instrument, effective date, and verbatim excerpt.
4. **Data-Integrity Verification:**
   - Run `evaluateClaimIntegrity()` and `sanitizeVisaDetailsForPublic()` to ensure invalid/expired claims cannot render as `VERIFIED` publicly.
5. **Required Human Approval:**
   - Immigration content reviewer approval required to move any staged item out of quarantine/draft into verified state.
6. **Post-Recovery Audit:**
   - Capture snapshot version via `visa_detail_versions` (`recordAuditVersionSnapshot`) explaining why the candidate extraction was rejected or corrected.

---

## Scenario 7: Accidental Publication of Unverified or Incorrect Content

1. **Detection Method:**
   - Admin audit, public sanitization check, or user report identifies an unverified, synthetic, or erroneous guide/claim published to `content/` or `visa_details`.
2. **Immediate Containment:**
   - Immediately downgrade pathway/claim status via `POST /api/admin/visa-details/:programId/status` to `QUARANTINED` or `NEEDS_EVIDENCE`, OR remove/unpublish the markdown file back to `content/drafts`.
   - `sanitizeVisaDetailsForPublic()` immediately suppresses withheld/quarantined/unverified records on public endpoints.
3. **Safe Recovery Steps:**
   - List immutable version history via `GET /api/admin/visa-details/:programId/versions`.
   - Execute `POST /api/admin/visa-details/:programId/versions/:versionId/restore` referencing the last verified version ID (creates a new forward audit version without erasing history).
4. **Data-Integrity Verification:**
   - Query public endpoint `/api/visa-details/:programId` and verify SSR rendering confirms the unverified text is completely absent and `suppressedClaimsSummary` reflects containment.
5. **Required Human Approval:**
   - Dual approval (engineering + compliance reviewer) required before republishing the corrected record.
6. **Post-Recovery Audit:**
   - Review audit trail in `visa_detail_versions` and `cron_execution_logs` to tighten validation rules preventing recurrence.

---

## Scenario 8: Backup Corruption (Checksum Mismatch or Truncated Archive)

1. **Detection Method:**
   - `verifyBackupRestore()` / `scripts/verifyBackupRestore.ts` fails with `TAR_EXTRACTION_FAILED`, `Checksum mismatches`, `Missing files from archive`, or `backup_manifest.json is missing`.
2. **Immediate Containment:**
   - Mark the corrupted `.tar.gz` file as unusable (rename or quarantine—never delete older known-good archives).
   - Do NOT attempt to restore the corrupted archive onto any live database.
3. **Safe Recovery Steps:**
   - Immediately run `npx tsx scripts/createVerifiedBackup.ts --out <new-timestamped-backup.tar.gz>` to create a fresh WAL-consistent snapshot and verify it end-to-end.
   - If the live database itself is already impaired, fall back to the most recent prior verified archive that passes `verifyBackupRestore()`.
4. **Data-Integrity Verification:**
   - Confirm `verifyBackupRestore()` outputs `success: true`, `manifestVerified: true`, `checksumMismatches: []`, `sqliteIntegrityOk: true`, `sqliteTableCountsMatch: true`.
5. **Required Human Approval:**
   - Infrastructure lead verifies SHA-256 checksum of the replacement archive and approves retention schedule.
6. **Post-Recovery Audit:**
   - Record `BACKUP_OUTCOME` / `RESTORE_VERIFICATION` incident summary and check host disk space / filesystem health where corruption occurred.

---

## Scenario 9: Failed Restore Procedure

1. **Detection Method:**
   - Temporary directory restore fails SQLite open, `PRAGMA integrity_check`, `PRAGMA foreign_key_check`, row count parity check, or CSV parse validation.
2. **Immediate Containment:**
   - Because restore validation ALWAYS executes in an isolated temporary directory first, production storage remains untouched. Abort promotion immediately (`SAFETY_ABORT`).
3. **Safe Recovery Steps:**
   - Inspect `RestoreVerificationReport.errors`, `csvErrors`, and `missingFiles` to determine whether the archive was damaged or the migration/schema version is incompatible.
   - Select the preceding verified archive and execute `verifyBackupRestore()` in a clean temporary directory until all checks pass `100%`.
4. **Data-Integrity Verification:**
   - Verify restored SQLite DB passes `auditSqliteDatabaseIntegrity()` and application smoke tests run cleanly against the isolated restored DB via `VISAAPPLY_SQLITE_PATH=<temp-restored-db>`.
5. **Required Human Approval:**
   - Principal engineer + DBA/data owner must review the green `RestoreVerificationReport` before any cutover action.
6. **Post-Recovery Audit:**
   - Document why the restore failed and add a regression test case covering the failure signature.

---

## Scenario 10: Credential or Secret Exposure (Logs, Archives, or Environment Leak)

1. **Detection Method:**
   - Secret scanner, log inspection, or backup audit (`forbiddenSecretFilesFound.length > 0`) detects `.env*`, `CRON_SECRET`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`, `RESEND_API_KEY`, or `DATABASE_URL` / `NEON_*` outside protected secret storage.
2. **Immediate Containment:**
   - Immediately revoke and rotate ALL exposed credentials (`CRON_SECRET`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`, `RESEND_API_KEY`, PostgreSQL database password/role) in Vercel / Neon / Google AI Studio Secrets UI.
   - Invalidate active admin sessions (automatically achieved when `ADMIN_PASSWORD` is rotated because HMAC tokens derive from it).
3. **Safe Recovery Steps:**
   - Purge/quarantine any archive containing leaked files (`verifyBackupRestore` rejects `.env*` files automatically) and scrub affected logs.
   - Verify `redactSensitiveData()` covers the leaked secret format and confirm `.gitignore` + `backupManager.ts` `EXCLUDED_PATTERNS` exclude all secret files.
4. **Data-Integrity Verification:**
   - Verify old credentials return HTTP `401` across `/api/admin*` and `/api/cron*`.
   - Confirm newly rotated secrets pass `/api/admin` and `verifyCronAuth` tests and that no operational event logs retain plaintext values.
5. **Required Human Approval:**
   - Security owner / repository administrator confirms credential rotation completion across all runtime environments.
6. **Post-Recovery Audit:**
   - Audit access logs and database modification history across the exposure window for any unauthorized mutations; run full `auditSqliteDatabaseIntegrity()` before closing the incident.
