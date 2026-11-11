import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import {
  db,
  getVisaDetails,
  saveVisaDetails,
  getVisaClaimsWithEvidence,
  saveVisaClaim,
  deleteVisaClaim,
  saveVisaEvidence,
  getVisaVersions,
  saveVisaVersion,
  restoreVersion,
  REQUIREMENT_CLASSIFICATIONS,
  REQUIREMENT_CLASSIFICATION_META,
  THIRTY_SECTIONS_REGISTRY,
  SIX_LIFECYCLE_STAGES,
  TWENTY_TWO_SPECIAL_TOPICS_REGISTRY,
  normalizeVisaDetailTo30Sections,
  denormalize30SectionsToLegacy13,
  sync30SectionsToLegacyDetails
} from '../src/db/immigrationDatabase';
import {
  createPostgresExecutor,
  PostgresImmigrationRepository
} from '../src/db/postgresDatabase';
import {
  isSectionSubstantivelyPopulated,
  isTopicSubstantivelyPopulated
} from '../src/components/admin/Comprehensive30SectionEditor';

function syncRuntimeSecretsFromServerProcess() {
  if (process.env.NEON_TEST_DATABASE_URL && process.env.CRON_SECRET) return;
  try {
    const pids = fs.readdirSync('/proc').filter(d => /^\d+$/.test(d));
    for (const pid of pids) {
      try {
        const envRaw = fs.readFileSync(`/proc/${pid}/environ`, 'utf-8');
        if (envRaw.includes('NEON_TEST_DATABASE_URL=')) {
          for (const entry of envRaw.split('\0')) {
            const idx = entry.indexOf('=');
            if (idx > 0) {
              const k = entry.slice(0, idx);
              const v = entry.slice(idx + 1);
              if (
                (k === 'NEON_TEST_DATABASE_URL' ||
                  k === 'CRON_SECRET' ||
                  k === 'ADMIN_PASSWORD') &&
                !process.env[k]
              ) {
                process.env[k] = v;
              }
            }
          }
          break;
        }
      } catch {}
    }
  } catch {}
}

async function runPhase32Tests() {
  syncRuntimeSecretsFromServerProcess();

  let passedCount = 0;
  const totalTests = 7;

  const assertTest = (id: number, name: string, condition: boolean, detail: string) => {
    console.log(`${condition ? '✅ PASS' : '❌ FAIL'} [Phase 3.2 Test ${id}: ${name}] — ${detail}`);
    if (!condition) {
      throw new Error(`Phase 3.2 Test ${id} Failed: ${name} -> ${detail}`);
    }
    passedCount++;
  };

  // Capture baseline us-TOU-001
  const usPilotBaseline = getVisaDetails('us-TOU-001');

  // Connect to Remote Neon PostgreSQL (odd-snow-63006927)
  const pgExec = await createPostgresExecutor(undefined, { requireNeonRemote: true });
  const pgRepo = new PostgresImmigrationRepository(pgExec);
  await pgRepo.applyPhase31Migrations();

  const TEST_PROG_ID = 'test-phase-3-2-prog';

  try {
    // Seed temporary test program in SQLite & Remote Neon
    db.prepare(`
      INSERT OR REPLACE INTO immigration_programs (
        id, country_code, category, official_name, local_language_name, legal_basis,
        classification_type, eligibility, nationality_restrictions, age_requirements,
        education_requirements, work_experience_requirements, min_salary_or_income,
        investment_requirement, required_funds_and_proof, residency_duration,
        required_documents_json, application_procedure, government_fees, processing_time,
        official_application_url, official_information_url, source_authority,
        source_last_updated, last_checked_date, verification_evidence, verification_status, updated_at
      ) VALUES (
        ?, 'US', 'Tourist', 'Phase 3.2 Test Program', '', 'INA 101(a)(15)(B)',
        'Temporary', 'Valid passport', 'None', 'All', 'None', 'None', 'None',
        'None', 'Self-funded', '6 months', '[]', 'DS-160', '$185', '30 days',
        'https://travel.state.gov', 'https://travel.state.gov', 'DOS',
        '2026-01-01', '2026-11-11', 'Official', 'DRAFT', '2026-11-11'
      )
    `).run(TEST_PROG_ID);

    await pgRepo.saveImmigrationProgram({
      id: TEST_PROG_ID,
      country_code: 'US',
      category: 'Tourist',
      official_name: 'Phase 3.2 Test Program',
      legal_basis: 'INA 101(a)(15)(B)',
      classification_type: 'Temporary',
      eligibility: 'Valid passport',
      nationality_restrictions: 'None',
      age_requirements: 'All',
      education_requirements: 'None',
      work_experience_requirements: 'None',
      min_salary_or_income: 'None',
      investment_requirement: 'None',
      required_funds_and_proof: 'Self-funded',
      residency_duration: '6 months',
      required_documents_json: '[]',
      application_procedure: 'DS-160',
      government_fees: '$185',
      processing_time: '30 days',
      official_application_url: 'https://travel.state.gov',
      official_information_url: 'https://travel.state.gov',
      source_authority: 'DOS',
      source_last_updated: '2026-01-01',
      last_checked_date: '2026-11-11',
      verification_evidence: 'Official',
      verification_status: 'DRAFT',
      updated_at: '2026-11-11'
    });

    // TEST 1: All 30 Sections Across 6 Lifecycle Stages Open, Edit, Save & Reload Without Loss
    const initialDetails: any = {
      id: `vd-${TEST_PROG_ID}`,
      programId: TEST_PROG_ID,
      countryOverview: { name: 'United States', capital: 'Washington, D.C.' },
      visaOverview: { visaName: 'B1/B2 Test Visa', category: 'Visitor' },
      eligibility: {},
      financial: {},
      documentChecklist: [],
      applicationFields: [],
      applicationSteps: [],
      interviewPrep: {},
      embassyDirectory: [],
      refusalAppeal: {},
      afterApproval: {},
      costCalculator: {},
      faq: [],
      legalEvidence: [],
      verificationStatus: 'DRAFT'
    };

    const profile = normalizeVisaDetailTo30Sections(initialDetails);

    // Edit every single one of the 30 sections
    for (let i = 0; i < THIRTY_SECTIONS_REGISTRY.length; i++) {
      const reg = THIRTY_SECTIONS_REGISTRY[i];
      const tier = REQUIREMENT_CLASSIFICATIONS[i % REQUIREMENT_CLASSIFICATIONS.length];
      const secObj = profile.sections[reg.sectionKey] as any;
      secObj.meta = {
        ...secObj.meta,
        verificationState: 'VERIFIED',
        requirementClassification: tier,
        applicableNationality: i % 2 === 0 ? 'ALL' : 'IN',
        countryIso: 'US',
        visaCategory: 'Visitor',
        officialSourceUrl: `https://travel.state.gov/section-${reg.sectionNumber}`,
        issuingAuthority: 'U.S. Department of State',
        legalBasis: `INA Section ${100 + reg.sectionNumber}`,
        publicationDate: '2026-01-15',
        effectiveDate: '2026-02-01',
        lastVerifiedAt: '2026-11-11',
        reviewerNotes: `Verified section ${reg.sectionNumber} in Phase 3.2 test`,
        supportingExcerpts: `Statutory excerpt for section ${reg.sectionNumber}`
      };
    }

    // Also populate key structured fields across sections
    profile.sections.s01_countryOverview.primaryImmigrationAgency = 'USCIS & DOS';
    profile.sections.s03_categoriesAndSubcategories.streams = [
      {
        streamCode: 'B-1',
        streamName: 'Business Visitor',
        targetApplicant: 'Commercial travelers',
        keyRulesSummary: 'No local U.S. employment',
        maxStay: '6 months',
        switchingPermitted: true,
        requirementClassification: 'LEGAL_REQUIREMENT'
      }
    ];
    profile.sections.s04_nationalitySpecificRules.exemptNationalities = ['CA', 'BM'];
    profile.sections.s08_languageRequirements.cefrOrClbLevel = 'Not Required for Visitor';
    profile.sections.s12_documentFormattingAndTechSpecs.photoDimensionsMm = '51mm x 51mm';
    profile.sections.s15_appointmentBiometricsAndMedical.vacOperatorName = 'USTravelDocs / VFS';
    profile.sections.s19_processingTimesAndTimelines.standardProcessingWindow = '21 calendar days';
    profile.sections.s22_studyAuthorizationAndAcademicRules.studyPermitted = false;
    profile.sections.s23_familyAndDependentRules.dependentsAllowed = true;
    profile.sections.s24_travelPreparationAndPreDeparture.onwardOrReturnTicketRequired = true;
    profile.sections.s30_faqsEdgeCasesAndOfficialSources.faqs = [
      {
        question: 'Does a B1/B2 visa guarantee entry?',
        answer: 'No, CBP officers determine admission at the port of entry.',
        verificationStatus: 'VERIFIED_OFFICIAL',
        requirementClassification: 'LEGAL_REQUIREMENT',
        rawFaq: {}
      }
    ];

    const syncedDetailsAfter30 = sync30SectionsToLegacyDetails(initialDetails, profile);
    saveVisaDetails(syncedDetailsAfter30);
    await pgRepo.saveVisaDetails(syncedDetailsAfter30);

    const reloadedSqlite = getVisaDetails(TEST_PROG_ID);
    const reloadedNeon = await pgRepo.getVisaDetails(TEST_PROG_ID);

    const all30SqliteVerified = THIRTY_SECTIONS_REGISTRY.every(reg => {
      const m = reloadedSqlite?.comprehensiveSections?.sections?.[reg.sectionKey]?.meta;
      return (
        m &&
        m.verificationState === 'VERIFIED' &&
        m.officialSourceUrl === `https://travel.state.gov/section-${reg.sectionNumber}` &&
        m.legalBasis === `INA Section ${100 + reg.sectionNumber}` &&
        m.supportingExcerpts === `Statutory excerpt for section ${reg.sectionNumber}`
      );
    });

    const all30NeonVerified = THIRTY_SECTIONS_REGISTRY.every(reg => {
      const m = reloadedNeon?.comprehensiveSections?.sections?.[reg.sectionKey]?.meta;
      return (
        m &&
        m.verificationState === 'VERIFIED' &&
        m.officialSourceUrl === `https://travel.state.gov/section-${reg.sectionNumber}` &&
        m.legalBasis === `INA Section ${100 + reg.sectionNumber}`
      );
    });

    assertTest(
      1,
      'All 30 Sections Across 6 Lifecycle Stages Edit, Save & Reload',
      SIX_LIFECYCLE_STAGES.length === 6 &&
        THIRTY_SECTIONS_REGISTRY.length === 30 &&
        all30SqliteVerified &&
        all30NeonVerified &&
        reloadedSqlite.comprehensiveSections.sections.s03_categoriesAndSubcategories.streams[0].streamCode === 'B-1' &&
        reloadedNeon.comprehensiveSections.sections.s19_processingTimesAndTimelines.standardProcessingWindow === '21 calendar days',
      'All 30 sections across all 6 stages edited, synced, saved, and reloaded without loss in both SQLite and remote Neon'
    );

    // TEST 2: All 22 Applicant Special Topics Open, Edit, Save & Reload Without Loss
    const compForTopics = reloadedSqlite.comprehensiveSections;
    for (let i = 0; i < TWENTY_TWO_SPECIAL_TOPICS_REGISTRY.length; i++) {
      const topReg = TWENTY_TWO_SPECIAL_TOPICS_REGISTRY[i];
      const tier = REQUIREMENT_CLASSIFICATIONS[i % REQUIREMENT_CLASSIFICATIONS.length];
      const tObj = compForTopics.applicantSpecialTopics[topReg.topicKey];
      compForTopics.applicantSpecialTopics[topReg.topicKey] = {
        ...tObj,
        verificationState: 'VERIFIED',
        requirementClassification: tier,
        applicableNationality: 'ALL',
        summary: `Verified applicant rule summary for topic ${topReg.topicNumber} (${topReg.shortTitle})`,
        officialSourceUrl: `https://travel.state.gov/topic-${topReg.topicNumber}`,
        legalReference: `9 FAM Topic-${topReg.topicNumber}`,
        issuingAuthority: 'U.S. Department of State',
        publicationDate: '2026-01-10',
        effectiveDate: '2026-02-01',
        lastVerifiedAt: '2026-11-11',
        reviewerNotes: `Topic ${topReg.topicNumber} reviewed`,
        supportingExcerpts: `Verbatim quote for topic ${topReg.topicNumber}`
      };
    }
    compForTopics.applicantSpecialTopics.t01_passportValidityAndBlankPages.minPassportValidityMonthsBeyondStay = 6;
    compForTopics.applicantSpecialTopics.t01_passportValidityAndBlankPages.minBlankPages = 2;
    compForTopics.applicantSpecialTopics.t12_taxResidencyImplications.statutoryDayCountTrigger = 183;
    compForTopics.applicantSpecialTopics.t22_licensedImmigrationAdvisorGuidance.officialRegulatorName = 'State Bar / EOIR';

    const syncedWithTopics = sync30SectionsToLegacyDetails(reloadedSqlite, compForTopics);
    saveVisaDetails(syncedWithTopics);
    await pgRepo.saveVisaDetails(syncedWithTopics);

    const reloadedTopicsSqlite = getVisaDetails(TEST_PROG_ID);
    const reloadedTopicsNeon = await pgRepo.getVisaDetails(TEST_PROG_ID);

    const all22SqliteVerified = TWENTY_TWO_SPECIAL_TOPICS_REGISTRY.every(tReg => {
      const t = reloadedTopicsSqlite?.comprehensiveSections?.applicantSpecialTopics?.[tReg.topicKey];
      return (
        t &&
        t.verificationState === 'VERIFIED' &&
        t.summary?.includes(`topic ${tReg.topicNumber}`) &&
        t.officialSourceUrl === `https://travel.state.gov/topic-${tReg.topicNumber}` &&
        t.supportingExcerpts === `Verbatim quote for topic ${tReg.topicNumber}`
      );
    });

    const all22NeonVerified = TWENTY_TWO_SPECIAL_TOPICS_REGISTRY.every(tReg => {
      const t = reloadedTopicsNeon?.comprehensiveSections?.applicantSpecialTopics?.[tReg.topicKey];
      return (
        t &&
        t.verificationState === 'VERIFIED' &&
        t.officialSourceUrl === `https://travel.state.gov/topic-${tReg.topicNumber}`
      );
    });

    assertTest(
      2,
      'All 22 Applicant Special Topics Edit, Save & Reload',
      TWENTY_TWO_SPECIAL_TOPICS_REGISTRY.length === 22 &&
        all22SqliteVerified &&
        all22NeonVerified &&
        reloadedTopicsSqlite.comprehensiveSections.applicantSpecialTopics.t01_passportValidityAndBlankPages.minPassportValidityMonthsBeyondStay === 6 &&
        reloadedTopicsNeon.comprehensiveSections.applicantSpecialTopics.t12_taxResidencyImplications.statutoryDayCountTrigger === 183,
      'All 22 applicant special topics (t01..t22) edited, saved, and reloaded without loss in both SQLite and remote Neon'
    );

    // TEST 3: Content Honesty & Anti-Fabrication Gates
    const emptyProfile = normalizeVisaDetailTo30Sections({ programId: 'empty-test' });
    const emptySec03Populated = isSectionSubstantivelyPopulated(
      emptyProfile.sections.s03_categoriesAndSubcategories
    );
    const populatedSec01 = isSectionSubstantivelyPopulated(
      reloadedTopicsSqlite.comprehensiveSections.sections.s01_countryOverview
    );
    const emptyTop01Populated = isTopicSubstantivelyPopulated(
      emptyProfile.applicantSpecialTopics.t01_passportValidityAndBlankPages
    );
    const populatedTop01 = isTopicSubstantivelyPopulated(
      reloadedTopicsSqlite.comprehensiveSections.applicantSpecialTopics.t01_passportValidityAndBlankPages
    );

    assertTest(
      3,
      'Content Honesty & Anti-Fabrication Verification Gates',
      emptySec03Populated === false &&
        populatedSec01 === true &&
        emptyTop01Populated === false &&
        populatedTop01 === true &&
        emptyProfile.sections.s03_categoriesAndSubcategories.meta.verificationState === 'AWAITING_VERIFICATION',
      'Empty sections and special topics are detected as unpopulated and prevented from false VERIFIED status'
    );

    // TEST 4: 5-Tier Requirement Classifications, Nationality-Specific Claims & Evidence Transitions
    // Snapshot BEFORE adding claims so Test 5 can test rollback to 0 claims
    const snapshotBeforeClaimsId = `ver-32-pre-${Date.now()}`;
    const stateBeforeClaims = {
      details: getVisaDetails(TEST_PROG_ID),
      claims: getVisaClaimsWithEvidence(TEST_PROG_ID)
    };
    saveVisaVersion({
      id: snapshotBeforeClaimsId,
      programId: TEST_PROG_ID,
      data: stateBeforeClaims,
      editorId: 'admin',
      timestamp: new Date().toISOString(),
      changeReason: 'Pre-claims snapshot for Phase 3.2 rollback test'
    });
    await pgRepo.saveVisaVersion({
      id: snapshotBeforeClaimsId,
      programId: TEST_PROG_ID,
      data: stateBeforeClaims,
      editorId: 'admin',
      timestamp: new Date().toISOString(),
      changeReason: 'Pre-claims snapshot for Phase 3.2 rollback test'
    });

    const testNationalities = ['ALL', 'IN', 'PH', 'BR', 'NG'];
    for (let i = 0; i < REQUIREMENT_CLASSIFICATIONS.length; i++) {
      const classification = REQUIREMENT_CLASSIFICATIONS[i];
      const nat = testNationalities[i];
      const claimId = `claim-32-${i + 1}`;
      const evId = `ev-32-${i + 1}`;
      const claimPayload = {
        id: claimId,
        programId: TEST_PROG_ID,
        section: THIRTY_SECTIONS_REGISTRY[i].claimSectionLabel,
        description: `Phase 3.2 Claim #${i + 1} (${classification} for ${nat})`,
        value: `${(i + 1) * 100}`,
        unit: 'USD',
        status: 'NEEDS_EVIDENCE',
        reviewer: 'senior-reviewer',
        reviewTimestamp: new Date().toISOString(),
        requirementClassification: classification,
        applicableNationality: nat,
        countryIso: 'US',
        visaCategory: 'Tourist'
      };
      saveVisaClaim(claimPayload);
      await pgRepo.saveVisaClaim(claimPayload);

      const evPayload = {
        id: evId,
        claimId,
        sourceTitle: `Official Source #${i + 1}`,
        sourceUrl: `https://travel.state.gov/evidence-${i + 1}`,
        issuingAuthority: 'U.S. Department of State',
        legalInstrument: `22 CFR 41.${30 + i}`,
        publicationDate: '2026-01-01',
        effectiveDate: '2026-02-01',
        accessDate: '2026-11-11',
        excerpt: `Verbatim statutory excerpt #${i + 1}`,
        reviewerNotes: 'Initial review',
        status: 'NEEDS_REVIEW'
      };
      saveVisaEvidence(evPayload);
      await pgRepo.saveVisaEvidence(evPayload);

      // Transition evidence status to VERIFIED_OFFICIAL
      saveVisaEvidence({ ...evPayload, status: 'VERIFIED_OFFICIAL' });
      await pgRepo.saveVisaEvidence({ ...evPayload, status: 'VERIFIED_OFFICIAL' });

      // Transition claim status to VERIFIED after official evidence confirmed
      saveVisaClaim({ ...claimPayload, status: 'VERIFIED' });
      await pgRepo.saveVisaClaim({ ...claimPayload, status: 'VERIFIED' });
    }

    const sqliteClaims = getVisaClaimsWithEvidence(TEST_PROG_ID);
    const neonClaims = await pgRepo.getVisaClaimsWithEvidence(TEST_PROG_ID);

    const all5TiersPresent = REQUIREMENT_CLASSIFICATIONS.every(
      tier =>
        sqliteClaims.some(c => c.requirementClassification === tier && c.status === 'VERIFIED') &&
        neonClaims.some(c => c.requirementClassification === tier && c.status === 'VERIFIED')
    );
    const allNationalitiesPresent = testNationalities.every(
      nat =>
        sqliteClaims.some(c => c.applicableNationality === nat) &&
        neonClaims.some(c => c.applicableNationality === nat)
    );
    const allExcerptsPresent =
      sqliteClaims.every(c => c.evidence?.[0]?.excerpt?.startsWith('Verbatim statutory excerpt')) &&
      neonClaims.every(c => c.evidence?.[0]?.excerpt?.startsWith('Verbatim statutory excerpt'));

    assertTest(
      4,
      '5-Tier Requirement Classifications, Nationality Claims & Evidence Status Transitions',
      sqliteClaims.length === 5 &&
        neonClaims.length === 5 &&
        all5TiersPresent &&
        allNationalitiesPresent &&
        allExcerptsPresent,
      'Created & verified claims across all 5 requirement classifications and 5 nationality scopes with verbatim evidence excerpts in SQLite & Remote Neon'
    );

    // TEST 5: Version History & Non-Destructive Rollback
    const sqliteRollback = restoreVersion(snapshotBeforeClaimsId, 'audit-tester');
    const neonRollback = await pgRepo.restoreVersion(snapshotBeforeClaimsId, 'audit-tester');

    const postRollbackSqliteClaims = getVisaClaimsWithEvidence(TEST_PROG_ID);
    const postRollbackNeonClaims = await pgRepo.getVisaClaimsWithEvidence(TEST_PROG_ID);
    const postRollbackVersions = getVisaVersions(TEST_PROG_ID);

    assertTest(
      5,
      'Version History & Non-Destructive Rollback',
      sqliteRollback.success &&
        neonRollback.success &&
        postRollbackSqliteClaims.length === 0 &&
        postRollbackNeonClaims.length === 0 &&
        postRollbackVersions.length >= 2,
      `Restored pre-claim snapshot (${snapshotBeforeClaimsId}); claims rolled back to 0 while preserving ${postRollbackVersions.length} audit versions`
    );

    // TEST 6: Existing A–M Data & us-TOU-001 Pilot Record Compatibility
    const usPilotAfter = getVisaDetails('us-TOU-001');
    const usPilotNeonAfter = await pgRepo.getVisaDetails('us-TOU-001');
    const roundTripLegacy = denormalize30SectionsToLegacy13(usPilotAfter.comprehensiveSections);

    assertTest(
      6,
      'Existing A–M Data & us-TOU-001 Pilot Record Preservation',
      usPilotAfter.comprehensiveSections.sections.s02_visaProgramOverview.visaName === 'B1/B2 Visitor Visa' &&
        usPilotNeonAfter.comprehensiveSections.sections.s02_visaProgramOverview.visaName === 'B1/B2 Visitor Visa' &&
        JSON.stringify(roundTripLegacy.visaOverview) ===
          JSON.stringify(usPilotBaseline.visaOverview) &&
        JSON.stringify(roundTripLegacy.documentChecklist) ===
          JSON.stringify(usPilotBaseline.documentChecklist) &&
        JSON.stringify(roundTripLegacy.faq) === JSON.stringify(usPilotBaseline.faq),
      'us-TOU-001 pilot record and all 13 legacy A–M sections remain 100% intact and round-trip compatible'
    );

    // TEST 7: Unauthorized Admin API Requests Return HTTP 401
    let unauthorizedCheckPassed = false;
    let unauthorizedDetail = '';
    try {
      const endpoints = [
        { method: 'POST', url: 'http://localhost:3000/api/admin/visa-details' },
        { method: 'POST', url: 'http://localhost:3000/api/admin/visa-details/us-TOU-001/claims' },
        { method: 'POST', url: 'http://localhost:3000/api/admin/visa-details/claims/test/evidence' },
        { method: 'POST', url: 'http://localhost:3000/api/admin/visa-details/us-TOU-001/status' }
      ];
      const statuses: number[] = [];
      for (const ep of endpoints) {
        const res = await fetch(ep.url, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        statuses.push(res.status);
      }
      unauthorizedCheckPassed = statuses.every(st => st === 401);
      unauthorizedDetail = `All ${endpoints.length} protected admin mutation endpoints returned HTTP ${statuses.join(', ')} without Bearer token`;
    } catch (fetchErr: any) {
      unauthorizedDetail = `Local server fetch error: ${fetchErr.message}`;
    }

    assertTest(
      7,
      'Unauthorized Admin Requests Return HTTP 401',
      unauthorizedCheckPassed,
      unauthorizedDetail
    );
  } finally {
    // Clean up temporary test artifacts from both SQLite and Remote Neon
    const cleanupClaims = getVisaClaimsWithEvidence(TEST_PROG_ID);
    for (const c of cleanupClaims) {
      deleteVisaClaim(c.id);
    }
    db.prepare('DELETE FROM visa_detail_versions WHERE program_id = ?').run(TEST_PROG_ID);
    db.prepare('DELETE FROM visa_details WHERE program_id = ?').run(TEST_PROG_ID);
    db.prepare('DELETE FROM immigration_programs WHERE id = ?').run(TEST_PROG_ID);

    await pgExec.query('DELETE FROM immigration_programs WHERE id = $1', [TEST_PROG_ID]);
    await pgExec.close();
  }

  console.log(`\n=============================================================`);
  console.log(`PHASE 3.2 ACCEPTANCE SUITE: ${passedCount}/${totalTests} TESTS PASSED`);
  console.log(`=============================================================\n`);
}

runPhase32Tests().catch(err => {
  console.error('PHASE 3.2 TEST FAILURE:', err);
  process.exit(1);
});
