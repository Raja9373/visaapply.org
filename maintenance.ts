import { db, initDatabaseSchema } from './src/db/immigrationDatabase';
import { VERIFIED_IMMIGRATION_PROGRAMS } from './src/data/globalImmigrationHubData';

function resetAndPopulate() {
  db.exec('DROP TABLE IF EXISTS visa_details');
  db.exec('DROP TABLE IF EXISTS immigration_programs');
  
  // Re-run init
  initDatabaseSchema();

  const stmt = db.prepare(`
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
      p.id, p.countryCode, p.category, p.officialName, p.localLanguageName || null, p.legalBasis,
      p.classificationType, p.eligibility, p.nationalityRestrictions, p.ageRequirements,
      p.educationRequirements, p.workExperienceRequirements, p.minSalaryOrIncome,
      p.investmentRequirement, p.requiredFundsAndProof, p.residencyDuration,
      p.renewalRules || null, p.prOrCitizenshipTransition || null, p.familyInclusionRules || null,
      p.workAndStudyRights || null, p.restrictionsAndExceptions || null, JSON.stringify(p.requiredDocuments),
      p.documentsAndFormats || null, p.translationAttestationRequirements || null, p.applicationProcedure,
      p.governmentFees, p.processingTime, p.applyFrom || null, p.officialApplicationUrl,
      p.officialInformationUrl, p.sourceAuthority, p.sourceLastUpdated, p.lastCheckedDate,
      p.verificationEvidence, p.verificationStatus, new Date().toISOString()
    );
  }
  console.log(`Populated ${VERIFIED_IMMIGRATION_PROGRAMS.length} programs.`);
}

resetAndPopulate();
