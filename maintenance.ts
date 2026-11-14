import path from 'node:path';
import { VERIFIED_IMMIGRATION_PROGRAMS } from './src/data/globalImmigrationHubData';
import { openSqliteDatabase, closeSqliteDatabase } from './src/db/sqliteCore';

function assertSafeDestructiveExecution(): string {
  const args = process.argv.slice(2);
  const hasCliFlag = args.includes('--confirm-destructive-reset');
  const hasEnvAck = process.env.ALLOW_DESTRUCTIVE_DB_RESET === 'YES_I_UNDERSTAND';

  if (!hasCliFlag || !hasEnvAck) {
    throw new Error(
      'SAFETY_ABORT: Destructive database reset blocked (fail-closed). Require both --confirm-destructive-reset and ALLOW_DESTRUCTIVE_DB_RESET=YES_I_UNDERSTAND.'
    );
  }

  const targetArgIdx = args.indexOf('--db');
  const rawTargetPath =
    targetArgIdx >= 0 && args[targetArgIdx + 1]
      ? args[targetArgIdx + 1]
      : process.env.VISAAPPLY_SQLITE_PATH || path.join(process.cwd(), 'data_db', 'immigration_hub.db');
  const resolvedTarget = path.resolve(rawTargetPath);
  const productionDbPath = path.resolve(process.cwd(), 'data_db', 'immigration_hub.db');

  if (resolvedTarget === productionDbPath && !args.includes('--allow-production-db')) {
    throw new Error(
      'SAFETY_ABORT: Refusing destructive reset on production database data_db/immigration_hub.db without --allow-production-db and verified backup.'
    );
  }

  return resolvedTarget;
}

function resetAndPopulate() {
  const targetDbPath = assertSafeDestructiveExecution();
  const targetDb = openSqliteDatabase(targetDbPath, { skipMigrations: true });

  try {
    const tx = targetDb.transaction(() => {
      targetDb.exec('PRAGMA foreign_keys = OFF;');
      targetDb.exec('DROP TABLE IF EXISTS visa_detail_evidence;');
      targetDb.exec('DROP TABLE IF EXISTS visa_detail_claims;');
      targetDb.exec('DROP TABLE IF EXISTS visa_detail_versions;');
      targetDb.exec('DROP TABLE IF EXISTS visa_details;');
      targetDb.exec('DROP TABLE IF EXISTS immigration_programs;');
      targetDb.exec('DROP TABLE IF EXISTS schema_migrations;');
    });
    tx();

    // Re-initialize schema cleanly with tracked migrations
    closeSqliteDatabase(targetDb);
    const freshDb = openSqliteDatabase(targetDbPath);

    try {
      const insertTx = freshDb.transaction(() => {
        const stmt = freshDb.prepare(`
          INSERT INTO immigration_programs (
            id, country_code, category, official_name, local_language_name, legal_basis,
            classification_type, eligibility, nationality_restrictions, age_requirements,
            education_requirements, work_experience_requirements, min_salary_or_income,
            investment_requirement, required_funds_and_proof, residency_duration,
            renewal_rules, pr_or_citizenship_transition, family_inclusion_rules,
            work_and_study_rights, restrictions_and_exceptions, required_documents_json,
            documents_and_formats, translation_attestation_requirements, application_procedure,
            government_fees, processing_time, apply_from, official_application_url,
            official_information_url, source_authority, source_last_updated, last_checked_date,
            verification_evidence, verification_status, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const p of VERIFIED_IMMIGRATION_PROGRAMS) {
          stmt.run(
            p.id,
            p.countryCode,
            p.category,
            p.officialName,
            p.localLanguageName || null,
            p.legalBasis,
            p.classificationType,
            p.eligibility,
            p.nationalityRestrictions,
            p.ageRequirements,
            p.educationRequirements,
            p.workExperienceRequirements,
            p.minSalaryOrIncome,
            p.investmentRequirement,
            p.requiredFundsAndProof,
            p.residencyDuration,
            p.renewalRules || null,
            p.prOrCitizenshipTransition || null,
            p.familyInclusionRules || null,
            p.workAndStudyRights || null,
            p.restrictionsAndExceptions || null,
            JSON.stringify(p.requiredDocuments),
            p.documentsAndFormats || null,
            p.translationAttestationRequirements || null,
            p.applicationProcedure,
            p.governmentFees,
            p.processingTime,
            p.applyFrom || null,
            p.officialApplicationUrl,
            p.officialInformationUrl,
            p.sourceAuthority,
            p.sourceLastUpdated,
            p.lastCheckedDate,
            p.verificationEvidence,
            p.verificationStatus,
            new Date().toISOString()
          );
        }
      });
      insertTx();
      console.log(`Populated ${VERIFIED_IMMIGRATION_PROGRAMS.length} programs in ${targetDbPath}.`);
    } finally {
      closeSqliteDatabase(freshDb);
    }
  } catch (err) {
    closeSqliteDatabase(targetDb);
    throw err;
  }
}

resetAndPopulate();
