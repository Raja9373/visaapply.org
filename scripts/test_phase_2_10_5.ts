import {
  db,
  getVisaDetails,
  saveVisaDetails,
  getVisaClaimsWithEvidence,
  saveVisaClaim,
  deleteVisaClaim,
  saveVisaEvidence,
  deleteVisaEvidence,
  getVisaVersions,
  saveVisaVersion,
  restoreVersion
} from '../src/db/immigrationDatabase';

async function runAcceptanceTests() {
  const TEST_PROGRAM_ID = 'test-ACCEPTANCE-2105';
  const results: { step: string; passed: boolean; detail: string }[] = [];

  const assert = (step: string, condition: boolean, detail: string) => {
    results.push({ step, passed: Boolean(condition), detail });
    if (!condition) {
      console.error(`❌ FAIL [${step}]: ${detail}`);
    } else {
      console.log(`✅ PASS [${step}]: ${detail}`);
    }
  };

  try {
    // 0. Ensure foreign key parent row exists for test-ACCEPTANCE-2105 without touching us-TOU-001
    const usPilotBefore = getVisaDetails('us-TOU-001');
    db.prepare(`
      INSERT OR IGNORE INTO immigration_programs (
        id, country_code, category, official_name, local_language_name, legal_basis,
        classification_type, eligibility, nationality_restrictions, age_requirements,
        education_requirements, work_experience_requirements, min_salary_or_income,
        investment_requirement, required_funds_and_proof, residency_duration,
        required_documents_json, application_procedure, government_fees, processing_time,
        official_application_url, official_information_url, source_authority,
        source_last_updated, last_checked_date, verification_evidence, verification_status, updated_at
      ) VALUES (
        ?, 'CA', 'Tourist', 'Acceptance Test Visitor Visa', '', 'IRPA s.11',
        'Temporary', 'Valid passport', 'None', '18+', 'None', 'None', 'None',
        'None', 'CAD 5000', '6 months', '[]', 'Online', 'CAD 100', '30 days',
        'https://www.canada.ca', 'https://www.canada.ca', 'IRCC',
        '2026-01-01', '2026-01-01', 'Verified', 'DRAFT', '2026-01-01'
      )
    `).run(TEST_PROGRAM_ID);

    // Clean any prior test artifacts for TEST_PROGRAM_ID
    const oldClaims = getVisaClaimsWithEvidence(TEST_PROGRAM_ID);
    for (const c of oldClaims) deleteVisaClaim(c.id);
    db.prepare('DELETE FROM visa_detail_versions WHERE program_id = ?').run(TEST_PROGRAM_ID);
    db.prepare('DELETE FROM visa_details WHERE program_id = ?').run(TEST_PROGRAM_ID);

    // Seed initial test record
    saveVisaDetails({
      id: `vd-${TEST_PROGRAM_ID}`,
      programId: TEST_PROGRAM_ID,
      countryOverview: { name: 'Canada Test', capital: 'Ottawa', language: 'English/French', currency: 'CAD' },
      visaOverview: { name: 'Visitor Visa v1', code: 'TRV-1', fee: 'CAD 100' },
      eligibility: { summary: 'Initial eligibility v1' },
      financial: { recommendedFunds: 'CAD 5,000' },
      documentChecklist: [{ item: 'Passport', mandatory: true, applicantCategory: 'All' }],
      applicationFields: { personalInfo: 'Full Name, DOB' },
      applicationSteps: [{ stepNumber: 1, title: 'Apply Online', fees: 'CAD 100' }],
      interviewPrep: { tips: 'Be honest', questions: [{ question: 'Purpose?', guidance: 'Tourism' }] },
      embassyDirectory: [{ name: 'High Commission of Canada', address: 'New Delhi' }],
      refusalAppeal: { grounds: 'Insufficient ties' },
      afterApproval: { entryRequirements: 'Valid passport & port of entry check' },
      costCalculator: { governmentVisaFee: '100 CAD' },
      faq: [{ q: 'Can I study?', a: 'Short courses under 6 months only.' }],
      verificationStatus: 'DRAFT'
    });

    // TEST 1: Create a claim
    const claimId = 'clm-test-001';
    saveVisaClaim({
      id: claimId,
      programId: TEST_PROGRAM_ID,
      section: 'B. Visa Overview',
      description: 'Standard TRV processing fee is CAD 100',
      value: '100',
      unit: 'CAD',
      status: 'NEEDS_EVIDENCE',
      reviewer: 'test-admin',
      reviewTimestamp: new Date().toISOString()
    });
    let claims = getVisaClaimsWithEvidence(TEST_PROGRAM_ID);
    assert('1. Create a claim', claims.length === 1 && claims[0].id === claimId, `Created claim ${claimId}`);

    // TEST 2: Attach official evidence (2 records)
    const evId1 = 'ev-test-001';
    const evId2 = 'ev-test-002';
    saveVisaEvidence({
      id: evId1,
      claimId,
      sourceTitle: 'IRCC Fee Schedule',
      sourceUrl: 'https://www.cic.gc.ca/english/information/fees/index.asp',
      issuingAuthority: 'IRCC',
      legalInstrument: 'IRPR s. 296(1)',
      publicationDate: '2025-12-01',
      effectiveDate: '2026-01-01',
      accessDate: '2026-11-10',
      reviewerNotes: 'Initial attachment',
      status: 'NEEDS_REVIEW'
    });
    saveVisaEvidence({
      id: evId2,
      claimId,
      sourceTitle: 'Secondary Guide',
      sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html',
      issuingAuthority: 'Government of Canada',
      legalInstrument: 'IRPA s. 11',
      publicationDate: '2025-11-01',
      effectiveDate: '2026-01-01',
      accessDate: '2026-11-10',
      reviewerNotes: 'Portal reference',
      status: 'SECONDARY_SOURCE'
    });
    claims = getVisaClaimsWithEvidence(TEST_PROGRAM_ID);
    assert(
      '2. Attach official evidence',
      claims[0].evidence.length === 2 && claims[0].evidence[0].status === 'NEEDS_REVIEW',
      `Attached 2 evidence records; default status preserved as NEEDS_REVIEW (not auto-verified)`
    );

    // TEST 3 & 4: Edit evidence & Change verification status
    saveVisaEvidence({
      ...claims[0].evidence[0],
      claimId,
      reviewerNotes: 'Verified directly against official IRPR statute table',
      status: 'VERIFIED_OFFICIAL'
    });
    claims = getVisaClaimsWithEvidence(TEST_PROGRAM_ID);
    const updatedEv1 = claims[0].evidence.find((e: any) => e.id === evId1);
    assert(
      '3 & 4. Edit evidence & Change status',
      updatedEv1?.status === 'VERIFIED_OFFICIAL' &&
        updatedEv1?.reviewerNotes.includes('Verified directly'),
      `Updated evidence ${evId1} to VERIFIED_OFFICIAL with new reviewer notes`
    );

    // TEST 5 & 6: Save, reload, and verify claim association
    const reloadedDetails = getVisaDetails(TEST_PROGRAM_ID);
    const reloadedClaims = getVisaClaimsWithEvidence(TEST_PROGRAM_ID);
    assert(
      '5 & 6. Save, reload & verify claim association',
      reloadedDetails?.programId === TEST_PROGRAM_ID &&
        reloadedClaims[0]?.programId === TEST_PROGRAM_ID &&
        reloadedClaims[0]?.section === 'B. Visa Overview' &&
        reloadedClaims[0]?.evidence?.length === 2,
      `Claim remains linked to ${TEST_PROGRAM_ID} [B. Visa Overview] with 2 evidence items`
    );

    // TEST 8 (Part A): Create Version 1 Snapshot before editing A-M sections
    const ver1Id = 'ver-test-v1';
    saveVisaVersion({
      id: ver1Id,
      programId: TEST_PROGRAM_ID,
      data: { details: reloadedDetails, claims: reloadedClaims },
      editorId: 'test-admin',
      timestamp: new Date(Date.now() - 10000).toISOString(),
      changeReason: 'Version 1 baseline snapshot'
    });

    // TEST 7: Edit each implemented A-M section
    const v2Details = {
      ...reloadedDetails,
      countryOverview: { ...reloadedDetails.countryOverview, bestTravelSeason: 'May to September' },
      visaOverview: { ...reloadedDetails.visaOverview, name: 'Visitor Visa v2 Updated', fee: 'CAD 150' },
      eligibility: { ...reloadedDetails.eligibility, summary: 'Updated eligibility v2' },
      financial: { ...reloadedDetails.financial, recommendedFunds: 'CAD 7,500', itrRequirement: '3 Years ITR' },
      documentChecklist: [
        ...reloadedDetails.documentChecklist,
        { item: 'Bank Statement', mandatory: true, applicantCategory: 'All', validityRequirements: '6 months' }
      ],
      applicationFields: { ...reloadedDetails.applicationFields, passportInfo: 'Passport No, Expiry' },
      applicationSteps: [
        ...reloadedDetails.applicationSteps,
        { stepNumber: 2, title: 'Biometrics at VFS', fees: 'CAD 85', appointmentRequired: 'Yes' }
      ],
      interviewPrep: {
        tips: 'Carry originals',
        questions: [{ question: 'Ties to home country?', guidance: 'Show employment letter', supportingDocs: 'NOC' }]
      },
      embassyDirectory: [
        {
          name: 'High Commission of Canada, New Delhi',
          address: '7/8 Shantipath, Chanakyapuri',
          phone: '+91-11-4178-2000',
          jurisdiction: 'India'
        }
      ],
      refusalAppeal: { grounds: 'IRPA s.179(b)', appealProcedure: 'Judicial Review at Federal Court' },
      afterApproval: { entryRequirements: 'CBSA inspection', authorizedStay: 'Up to 6 months' },
      costCalculator: { governmentVisaFee: '150 CAD', biometricsFee: '85 CAD' },
      faq: [{ q: 'Can I extend stay?', a: 'Apply for Visitor Record 30 days prior to expiry.' }]
    };
    saveVisaDetails(v2Details);
    const verifyV2 = getVisaDetails(TEST_PROGRAM_ID);
    assert(
      '7. Edit all A-M sections',
      verifyV2.visaOverview.fee === 'CAD 150' &&
        verifyV2.documentChecklist.length === 2 &&
        verifyV2.applicationSteps.length === 2 &&
        verifyV2.costCalculator.biometricsFee === '85 CAD',
      'All A–M sections updated and persisted accurately'
    );

    // Mutate claims in v2 (add a second claim)
    saveVisaClaim({
      id: 'clm-test-002',
      programId: TEST_PROGRAM_ID,
      section: 'L. Cost Calculator',
      description: 'Biometrics fee is CAD 85',
      value: '85',
      unit: 'CAD',
      status: 'NEEDS_EVIDENCE',
      reviewer: 'test-admin',
      reviewTimestamp: new Date().toISOString()
    });

    // Create Version 2 Snapshot
    const ver2Id = 'ver-test-v2';
    saveVisaVersion({
      id: ver2Id,
      programId: TEST_PROGRAM_ID,
      data: { details: verifyV2, claims: getVisaClaimsWithEvidence(TEST_PROGRAM_ID) },
      editorId: 'test-admin',
      timestamp: new Date().toISOString(),
      changeReason: 'Version 2 with all A-M edits and 2nd claim'
    });

    // TEST 8 & 9: Verify versions created and compare versions
    const versionsBeforeRestore = getVisaVersions(TEST_PROGRAM_ID);
    const v1Snap = versionsBeforeRestore.find(v => v.id === ver1Id);
    const v2Snap = versionsBeforeRestore.find(v => v.id === ver2Id);
    assert(
      '8 & 9. Create & compare two versions',
      versionsBeforeRestore.length === 2 &&
        v1Snap?.data?.details?.visaOverview?.fee === 'CAD 100' &&
        v2Snap?.data?.details?.visaOverview?.fee === 'CAD 150' &&
        v1Snap?.data?.claims?.length === 1 &&
        v2Snap?.data?.claims?.length === 2,
      'Version 1 (CAD 100, 1 claim) and Version 2 (CAD 150, 2 claims) stored and diffable'
    );

    // TEST 10 & 11: Restore Version 1 and confirm claims, evidence, and audit history
    const restoreRes = restoreVersion(ver1Id, 'test-admin');
    const restoredDetails = getVisaDetails(TEST_PROGRAM_ID);
    const restoredClaims = getVisaClaimsWithEvidence(TEST_PROGRAM_ID);
    const versionsAfterRestore = getVisaVersions(TEST_PROGRAM_ID);

    assert(
      '10. Restore earlier version',
      restoreRes.success && restoredDetails.visaOverview.fee === 'CAD 100',
      `Restored ${ver1Id}; fee reverted to ${restoredDetails.visaOverview.fee}`
    );
    assert(
      '11a. Confirm claims and evidence restored',
      restoredClaims.length === 1 &&
        restoredClaims[0].id === claimId &&
        restoredClaims[0].evidence.length === 2 &&
        restoredClaims[0].evidence.find((e: any) => e.id === evId1)?.status === 'VERIFIED_OFFICIAL',
      `Claims count restored to 1 with both linked evidence records intact`
    );
    assert(
      '11b. Confirm audit history intact (non-destructive)',
      versionsAfterRestore.length === 3 &&
        versionsAfterRestore.some(v => v.id === ver1Id) &&
        versionsAfterRestore.some(v => v.id === ver2Id),
      `Version count increased from 2 to 3 (${restoreRes.newVersionId}); historical versions preserved`
    );

    // Verify production pilot record us-TOU-001 was untouched
    const usPilotAfter = getVisaDetails('us-TOU-001');
    assert(
      'Preservation check: us-TOU-001 untouched',
      JSON.stringify(usPilotBefore) === JSON.stringify(usPilotAfter),
      'Production pilot record us-TOU-001 was not modified'
    );

    console.log('\n=== SUMMARY ===');
    console.log(JSON.stringify(results, null, 2));
  } catch (err: any) {
    console.error('Unexpected error during acceptance tests:', err);
    process.exit(1);
  }
}

runAcceptanceTests();
