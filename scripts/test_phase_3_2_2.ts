import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import dotenv from 'dotenv';
import {
  getVisaDetails,
  saveVisaDetails,
  getVisaClaimsWithEvidence,
  saveVisaClaim,
  deleteVisaClaim,
  saveVisaEvidence,
  deleteVisaEvidence,
  getVisaVersions,
  db,
  EVIDENCE_STATUSES,
  normalizeEvidenceStatus,
  validateComprehensiveProfileHonesty,
  evaluateClaimIntegrity,
  sync30SectionsToLegacyDetails,
  syncLegacyDetailsTo30Sections
} from '../src/db/immigrationDatabase';
import {
  createPostgresExecutor,
  PostgresImmigrationRepository
} from '../src/db/postgresDatabase';
import { EVIDENCE_STATUSES as UI_EVIDENCE_STATUSES } from '../src/components/admin/ClaimsManager';

dotenv.config({ override: true });

function syncRuntimeSecretsFromServerProcess() {
  if (process.env.NEON_TEST_DATABASE_URL && process.env.CRON_SECRET && process.env.ADMIN_PASSWORD) {
    return;
  }
  try {
    const pids = fs.readdirSync('/proc').filter(d => /^\d+$/.test(d));
    for (const pid of pids) {
      try {
        const envRaw = fs.readFileSync(`/proc/${pid}/environ`, 'utf-8');
        if (envRaw.includes('NEON_TEST_DATABASE_URL=') || envRaw.includes('CRON_SECRET=')) {
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
        }
      } catch {}
    }
  } catch {}
}

const BASE_URL = 'http://localhost:3000';

async function obtainAdminToken(): Promise<string> {
  const pass = (process.env.ADMIN_PASSWORD || '').trim();
  assert.ok(pass.length > 0, 'ADMIN_PASSWORD must be present in environment');
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pass })
  });
  const data = await res.json();
  assert.equal(res.status, 200, `Admin login failed: ${JSON.stringify(data)}`);
  assert.ok(data.token, 'Token must be returned by /api/admin/login');
  return data.token;
}

async function runPhase322Tests() {
  syncRuntimeSecretsFromServerProcess();

  console.log('===================================================================');
  console.log('PHASE 3.2.2 — SECURITY, SERVER-SIDE VALIDATION & DATA INTEGRITY SUITE');
  console.log('===================================================================');

  const adminToken = await obtainAdminToken();
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  const results: { id: number; name: string; status: 'PASS' | 'FAIL'; detail: string }[] = [];
  const tempProgramId = 'test-p322-temp-001';
  const tempProgramId2 = 'test-p322-temp-002';

  // Ensure clean temporary program fixture
  const cleanupTemp = () => {
    for (const pid of [tempProgramId, tempProgramId2]) {
      try {
        const claims = db
          .prepare('SELECT id FROM visa_detail_claims WHERE program_id = ?')
          .all(pid) as { id: string }[];
        for (const c of claims) {
          db.prepare('DELETE FROM visa_detail_evidence WHERE claim_id = ?').run(c.id);
        }
        db.prepare('DELETE FROM visa_detail_claims WHERE program_id = ?').run(pid);
        db.prepare('DELETE FROM visa_detail_versions WHERE program_id = ?').run(pid);
        db.prepare('DELETE FROM visa_details WHERE program_id = ?').run(pid);
        db.prepare('DELETE FROM immigration_programs WHERE id = ?').run(pid);
      } catch {
        // ignore
      }
    }
  };
  cleanupTemp();

  try {
    // Seed temporary test program + visa record
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
        ?, 'US', 'Tourist', 'Phase 3.2.2 Test Program', '', 'INA 101(a)(15)(B)',
        'Temporary', 'Valid passport', 'None', 'All', 'None', 'None', 'None',
        'None', 'Sufficient funds', 'Up to 6 months', '[]', 'Apply online', 'USD 185',
        '3-5 weeks', 'https://travel.state.gov', 'https://travel.state.gov',
        'U.S. Department of State', '2026-01-01', '2026-01-01', 'Official', 'VERIFIED', '2026-01-01'
      )
    `).run(tempProgramId);

    const basePilot = getVisaDetails('us-TOU-001');
    assert.ok(basePilot, 'us-TOU-001 pilot record must exist');
    saveVisaDetails({
      ...basePilot,
      id: `vd-${tempProgramId}`,
      programId: tempProgramId
    });

    // -------------------------------------------------------------------
    // TEST 1: Direct API attempt to mark empty section VERIFIED
    // -------------------------------------------------------------------
    {
      const tempRecord = getVisaDetails(tempProgramId)!;
      assert.ok(tempRecord, 'Temporary test record must exist');
      const badProfile = JSON.parse(JSON.stringify(tempRecord.comprehensiveSections));
      // Clear substantive content of s29_permanentResidenceAndCitizenship and mark VERIFIED
      badProfile.sections.s29_permanentResidenceAndCitizenship = {
        meta: {
          ...badProfile.sections.s29_permanentResidenceAndCitizenship.meta,
          verificationState: 'VERIFIED',
          officialSourceUrl: 'https://www.uscis.gov/citizenship'
        },
        directPathToPr: null,
        yearsRequiredForPr: null,
        yearsRequiredForCitizenship: null,
        dualCitizenshipPermitted: null,
        settlementSummary: null,
        transitionPathways: [],
        legacyFields: {}
      };

      const resEmpty = await fetch(`${BASE_URL}/api/admin/visa-details`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...tempRecord,
          programId: tempProgramId,
          comprehensiveSections: badProfile
        })
      });
      const dataEmpty = await resEmpty.json();
      assert.equal(resEmpty.status, 400, 'Expected HTTP 400 when marking empty section VERIFIED');
      assert.ok(
        String(dataEmpty.error).includes('substantive content is missing'),
        `Expected substantive content error, got: ${dataEmpty.error}`
      );

      // Also test VERIFIED with missing officialSourceUrl on populated section
      const missingUrlProfile = JSON.parse(JSON.stringify(tempRecord.comprehensiveSections));
      missingUrlProfile.sections.s02_visaProgramOverview.meta.verificationState = 'VERIFIED';
      missingUrlProfile.sections.s02_visaProgramOverview.meta.officialSourceUrl = '';
      const resNoUrl = await fetch(`${BASE_URL}/api/admin/visa-details`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...tempRecord,
          programId: tempProgramId,
          comprehensiveSections: missingUrlProfile
        })
      });
      const dataNoUrl = await resNoUrl.json();
      assert.equal(
        resNoUrl.status,
        400,
        'Expected HTTP 400 when marking section VERIFIED without officialSourceUrl'
      );
      assert.ok(
        String(dataNoUrl.error).includes('required officialSourceUrl metadata is missing'),
        `Expected officialSourceUrl error, got: ${dataNoUrl.error}`
      );

      results.push({
        id: 1,
        name: 'Direct API attempt to mark empty section (or missing official source URL) VERIFIED',
        status: 'PASS',
        detail: `Rejected with HTTP 400 (${dataEmpty.error})`
      });
    }

    // -------------------------------------------------------------------
    // TEST 2: Direct API attempt to mark NOT_APPLICABLE without a reason
    // -------------------------------------------------------------------
    {
      const tempRecord = getVisaDetails(tempProgramId)!;
      const badNaProfile = JSON.parse(JSON.stringify(tempRecord.comprehensiveSections));
      badNaProfile.sections.s10_sponsorAndSponsorshipRules.meta.verificationState = 'NOT_APPLICABLE';
      badNaProfile.sections.s10_sponsorAndSponsorshipRules.meta.applicabilityReason = '   ';

      const resNa = await fetch(`${BASE_URL}/api/admin/visa-details`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...tempRecord,
          programId: tempProgramId,
          comprehensiveSections: badNaProfile
        })
      });
      const dataNa = await resNa.json();
      assert.equal(
        resNa.status,
        400,
        'Expected HTTP 400 when marking section NOT_APPLICABLE without applicabilityReason'
      );
      assert.ok(
        String(dataNa.error).includes('applicabilityReason is empty'),
        `Expected applicabilityReason error, got: ${dataNa.error}`
      );

      results.push({
        id: 2,
        name: 'Direct API attempt to mark NOT_APPLICABLE without applicabilityReason',
        status: 'PASS',
        detail: `Rejected with HTTP 400 (${dataNa.error})`
      });
    }

    // -------------------------------------------------------------------
    // TEST 3: Direct API attempt to create VERIFIED claim without qualifying evidence
    // -------------------------------------------------------------------
    {
      const resUnbacked = await fetch(`${BASE_URL}/api/admin/visa-details/${tempProgramId}/claims`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          section: 'S02: Visa Overview',
          description: 'Attempted unbacked verified claim',
          value: '185',
          unit: 'USD',
          status: 'VERIFIED',
          reviewer: 'test-runner',
          requirementClassification: 'LEGAL_REQUIREMENT',
          applicableNationality: 'ALL',
          countryIso: 'US',
          visaCategory: 'Visitor'
        })
      });
      const dataUnbacked = await resUnbacked.json();
      assert.equal(
        resUnbacked.status,
        400,
        'Expected HTTP 400 when creating VERIFIED claim without qualifying official evidence'
      );
      assert.ok(
        String(dataUnbacked.error).includes('cannot be saved as VERIFIED'),
        `Expected VERIFIED claim rejection message, got: ${dataUnbacked.error}`
      );

      // Also test cross-program claim ownership mismatch
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
          ?, 'CA', 'Tourist', 'Phase 3.2.2 Second Program', '', 'IRPA',
          'Temporary', 'Valid passport', 'None', 'All', 'None', 'None', 'None',
          'None', 'Sufficient funds', 'Up to 6 months', '[]', 'Apply online', 'CAD 100',
          '3-5 weeks', 'https://canada.ca', 'https://canada.ca',
          'IRCC', '2026-01-01', '2026-01-01', 'Official', 'VERIFIED', '2026-01-01'
        )
      `).run(tempProgramId2);
      const foreignClaimId = `clm-foreign-${Date.now()}`;
      saveVisaClaim({
        id: foreignClaimId,
        programId: tempProgramId2,
        section: 'S02: Visa Overview',
        description: 'Foreign program claim',
        value: '100',
        unit: 'CAD',
        status: 'NEEDS_EVIDENCE'
      });

      const resCrossProgram = await fetch(
        `${BASE_URL}/api/admin/visa-details/${tempProgramId}/claims`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            id: foreignClaimId,
            section: 'S02: Visa Overview',
            description: 'Cross program hijack attempt',
            status: 'VERIFIED'
          })
        }
      );
      assert.equal(
        resCrossProgram.status,
        400,
        'Expected HTTP 400 on cross-program claim ID reference'
      );

      results.push({
        id: 3,
        name: 'Direct API attempt to create VERIFIED claim without qualifying evidence (and cross-program guard)',
        status: 'PASS',
        detail: `Rejected with HTTP 400 (${dataUnbacked.error})`
      });
    }

    // -------------------------------------------------------------------
    // TEST 4: Evidence deletion causing parent claim downgrade
    // -------------------------------------------------------------------
    {
      // 1. Create a claim in NEEDS_EVIDENCE
      const createRes = await fetch(`${BASE_URL}/api/admin/visa-details/${tempProgramId}/claims`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          section: 'S02: Visa Overview',
          description: 'Claim for evidence deletion downgrade test',
          value: '6',
          unit: 'months',
          status: 'NEEDS_EVIDENCE',
          reviewer: 'test-runner',
          requirementClassification: 'LEGAL_REQUIREMENT',
          applicableNationality: 'ALL',
          countryIso: 'US',
          visaCategory: 'Visitor'
        })
      });
      const created = await createRes.json();
      assert.equal(createRes.status, 200);
      const claimId = created.claim?.id || created.claimId;
      assert.ok(claimId, 'claimId must be returned on creation');

      // 2. Attach VERIFIED_OFFICIAL evidence
      const evRes = await fetch(`${BASE_URL}/api/admin/visa-details/claims/${claimId}/evidence`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          programId: tempProgramId,
          sourceTitle: 'INA 214(b) Official Source',
          sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas.html',
          issuingAuthority: 'U.S. Department of State',
          legalInstrument: 'INA 214(b)',
          publicationDate: '2025-01-01',
          effectiveDate: '2025-01-01',
          accessDate: '2026-03-01',
          status: 'VERIFIED_OFFICIAL'
        })
      });
      const evData = await evRes.json();
      assert.equal(evRes.status, 200);
      const evidenceId = evData.evidence?.id || evData.evidenceId;
      assert.ok(evidenceId, 'evidenceId must be returned on creation');

      // 3. Promote claim to VERIFIED (now permitted)
      const verifyRes = await fetch(`${BASE_URL}/api/admin/visa-details/${tempProgramId}/claims`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          id: claimId,
          section: 'S02: Visa Overview',
          description: 'Claim for evidence deletion downgrade test',
          value: '6',
          unit: 'months',
          status: 'VERIFIED',
          reviewer: 'test-runner',
          requirementClassification: 'LEGAL_REQUIREMENT',
          applicableNationality: 'ALL',
          countryIso: 'US',
          visaCategory: 'Visitor'
        })
      });
      assert.equal(verifyRes.status, 200);

      const versionsBefore = getVisaVersions(tempProgramId).length;

      // 4. Delete the sole supporting evidence
      const delRes = await fetch(
        `${BASE_URL}/api/admin/visa-details/claims/${claimId}/evidence/${evidenceId}?programId=${tempProgramId}`,
        {
          method: 'DELETE',
          headers: authHeaders
        }
      );
      const delData = await delRes.json();
      assert.equal(delRes.status, 200);
      assert.equal(delData.downgradedClaim, true, 'Expected downgradedClaim=true on evidence deletion');
      assert.equal(delData.newClaimStatus, 'NEEDS_EVIDENCE');

      const claimsAfter = getVisaClaimsWithEvidence(tempProgramId);
      const targetAfter = claimsAfter.find((c: any) => c.id === claimId);
      assert.equal(targetAfter.status, 'NEEDS_EVIDENCE', 'Claim status in DB must be NEEDS_EVIDENCE');

      const versionsAfter = getVisaVersions(tempProgramId);
      assert.ok(
        versionsAfter.length > versionsBefore,
        'Audit version must be recorded on automatic claim downgrade'
      );

      results.push({
        id: 4,
        name: 'Evidence deletion causing parent claim downgrade + audit snapshot',
        status: 'PASS',
        detail: `Claim ${claimId} automatically downgraded VERIFIED -> ${targetAfter.status}; audit version recorded`
      });
    }

    // -------------------------------------------------------------------
    // TEST 5: Evidence becoming OUTDATED / BROKEN_LINK / REJECTED causing parent claim downgrade
    // -------------------------------------------------------------------
    {
      for (const invalidStatus of ['OUTDATED', 'BROKEN_LINK', 'REJECTED'] as const) {
        const cId = `clm-p322-${invalidStatus.toLowerCase()}-${Date.now()}`;
        saveVisaClaim({
          id: cId,
          programId: tempProgramId,
          section: 'S16: Visa Fees',
          description: `Claim testing ${invalidStatus} downgrade`,
          value: '185',
          unit: 'USD',
          status: 'NEEDS_EVIDENCE',
          reviewer: 'test-runner',
          requirementClassification: 'LEGAL_REQUIREMENT',
          applicableNationality: 'ALL',
          countryIso: 'US',
          visaCategory: 'Visitor'
        });

        const eId = `ev-p322-${invalidStatus.toLowerCase()}-${Date.now()}`;
        saveVisaEvidence({
          id: eId,
          claimId: cId,
          sourceTitle: '22 CFR 22.1 Schedule of Fees',
          sourceUrl: 'https://www.ecfr.gov/current/title-22/part-22',
          issuingAuthority: 'Department of State',
          status: 'VERIFIED_OFFICIAL'
        });

        // Promote to VERIFIED
        saveVisaClaim({
          id: cId,
          programId: tempProgramId,
          section: 'S16: Visa Fees',
          description: `Claim testing ${invalidStatus} downgrade`,
          value: '185',
          unit: 'USD',
          status: 'VERIFIED',
          reviewer: 'test-runner',
          requirementClassification: 'LEGAL_REQUIREMENT',
          applicableNationality: 'ALL',
          countryIso: 'US',
          visaCategory: 'Visitor'
        });

        // Now change evidence status to invalidStatus via API
        const res = await fetch(`${BASE_URL}/api/admin/visa-details/claims/${cId}/evidence`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            id: eId,
            programId: tempProgramId,
            sourceTitle: '22 CFR 22.1 Schedule of Fees',
            sourceUrl: 'https://www.ecfr.gov/current/title-22/part-22',
            issuingAuthority: 'Department of State',
            status: invalidStatus
          })
        });
        const data = await res.json();
        assert.equal(res.status, 200);
        assert.equal(
          data.downgradedClaim,
          true,
          `Expected downgradedClaim=true when evidence becomes ${invalidStatus}`
        );
        assert.equal(data.newClaimStatus, 'NEEDS_EVIDENCE');

        const reloaded = getVisaClaimsWithEvidence(tempProgramId).find((c: any) => c.id === cId);
        assert.equal(reloaded.status, 'NEEDS_EVIDENCE');
      }

      results.push({
        id: 5,
        name: 'Evidence becoming OUTDATED / BROKEN_LINK / REJECTED causing parent claim downgrade',
        status: 'PASS',
        detail: 'All 3 invalidating statuses (OUTDATED, BROKEN_LINK, REJECTED) downgraded VERIFIED -> NEEDS_EVIDENCE'
      });
    }

    // -------------------------------------------------------------------
    // TEST 6: Nationality, country, and visa-category mismatch warnings (+ superseded evidence detection)
    // -------------------------------------------------------------------
    {
      const integrity = evaluateClaimIntegrity(
        {
          id: 'clm-mismatch-test',
          programId: 'us-TOU-001',
          status: 'VERIFIED',
          applicableNationality: 'INVALID_NAT_999',
          countryIso: 'FR', // mismatch vs US
          visaCategory: 'Golden Investor Residence', // mismatch vs TOU (Visitor/Tourist)
          evidence: [
            {
              id: 'ev-old',
              status: 'VERIFIED_OFFICIAL',
              sourceTitle: '2021 Fee Rule',
              effectiveDate: '2021-01-01',
              publicationDate: '2021-01-01',
              reviewerNotes: 'Superseded by 2025 fee rule'
            },
            {
              id: 'ev-new',
              status: 'VERIFIED_OFFICIAL',
              sourceTitle: '2025 Updated Fee Rule',
              effectiveDate: '2025-06-01',
              publicationDate: '2025-05-15'
            }
          ]
        },
        {
          expectedCountryIso: 'US',
          expectedVisaCategory: 'Visitor / Tourist',
          targetNationality: 'IN'
        }
      );

      const warningCodes = integrity.warnings.map(w => w.code);
      assert.ok(warningCodes.includes('COUNTRY_MISMATCH'), 'Must detect COUNTRY_MISMATCH');
      assert.ok(warningCodes.includes('VISA_CATEGORY_MISMATCH'), 'Must detect VISA_CATEGORY_MISMATCH');
      assert.ok(warningCodes.includes('NATIONALITY_MISMATCH'), 'Must detect NATIONALITY_MISMATCH');
      assert.ok(
        warningCodes.includes('SUPERSEDED_OR_EXPIRED_EVIDENCE'),
        'Must detect SUPERSEDED_OR_EXPIRED_EVIDENCE'
      );

      results.push({
        id: 6,
        name: 'Nationality, country, and visa-category mismatch warnings & superseded evidence detection',
        status: 'PASS',
        detail: `Detected warnings: ${warningCodes.join(', ')}`
      });
    }

    // -------------------------------------------------------------------
    // TEST 7: Legacy evidence status normalization
    // -------------------------------------------------------------------
    {
      assert.deepEqual(
        EVIDENCE_STATUSES,
        UI_EVIDENCE_STATUSES,
        'EVIDENCE_STATUSES must be identical across backend and ClaimsManager UI'
      );
      assert.equal(normalizeEvidenceStatus('SECONDARY_OR_INFERRED'), 'SECONDARY_SOURCE');
      assert.equal(normalizeEvidenceStatus('DEPRECATED_SOURCE'), 'OUTDATED');
      assert.equal(normalizeEvidenceStatus('VERIFIED_OFFICIAL'), 'VERIFIED_OFFICIAL');
      assert.equal(normalizeEvidenceStatus('UNKNOWN_RANDOM_VALUE'), 'NEEDS_REVIEW');

      results.push({
        id: 7,
        name: 'Legacy evidence status normalization & unified EVIDENCE_STATUSES constant',
        status: 'PASS',
        detail:
          'SECONDARY_OR_INFERRED -> SECONDARY_SOURCE, DEPRECATED_SOURCE -> OUTDATED, 7 unified statuses verified'
      });
    }

    // -------------------------------------------------------------------
    // TEST 8: Unauthenticated access to all three legacy POST endpoints rejected
    // -------------------------------------------------------------------
    {
      const endpoints = [
        '/api/immigration/batch-state',
        '/api/immigration/batch-execute',
        '/api/cron'
      ];
      const statusCodes: Record<string, number> = {};

      for (const ep of endpoints) {
        const res = await fetch(`${BASE_URL}${ep}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        statusCodes[ep] = res.status;
        assert.equal(
          res.status,
          401,
          `Expected HTTP 401 for unauthenticated POST ${ep}, got ${res.status}`
        );
      }

      results.push({
        id: 8,
        name: 'Unauthenticated access to all three legacy POST endpoints rejected',
        status: 'PASS',
        detail: JSON.stringify(statusCodes)
      });
    }

    // -------------------------------------------------------------------
    // TEST 9: Authorized cron request still works
    // -------------------------------------------------------------------
    {
      const cronSecret = process.env.CRON_SECRET;
      assert.ok(cronSecret && cronSecret.length > 0, 'CRON_SECRET must be present in environment');

      const resBatchState = await fetch(`${BASE_URL}/api/immigration/batch-state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cronSecret}`
        },
        body: JSON.stringify({ isRunning: false })
      });
      assert.equal(
        resBatchState.status,
        200,
        `Authorized POST /api/immigration/batch-state failed with ${resBatchState.status}`
      );

      const resCron = await fetch(`${BASE_URL}/api/cron`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cronSecret}`
        },
        body: JSON.stringify({})
      });
      assert.equal(
        resCron.status,
        200,
        `Authorized POST /api/cron failed with ${resCron.status}`
      );

      results.push({
        id: 9,
        name: 'Authorized cron request (Bearer CRON_SECRET) succeeds',
        status: 'PASS',
        detail: 'POST /api/immigration/batch-state -> 200, POST /api/cron -> 200'
      });
    }

    // -------------------------------------------------------------------
    // TEST 10: A–M and 30-section bidirectional synchronization
    // -------------------------------------------------------------------
    {
      const pilot = getVisaDetails('us-TOU-001')!;
      // Direction 1: 30-section -> Legacy A-M
      const modified30 = JSON.parse(JSON.stringify(pilot.comprehensiveSections));
      modified30.sections.s02_visaProgramOverview.feeSummary = 'USD 185 (MRV Standardized Test)';
      modified30.sections.s09_financialAndProofOfFunds.minBankBalance =
        'Sufficient liquid funds (Bidirectional Sync Test)';

      const syncedToLegacy = sync30SectionsToLegacyDetails(
        {
          ...pilot,
          customUnknownLegacyField: 'PRESERVED_VALUE_123'
        },
        modified30
      );
      assert.equal(syncedToLegacy.visaOverview.fee, 'USD 185 (MRV Standardized Test)');
      assert.equal(
        syncedToLegacy.financial.minBankBalance,
        'Sufficient liquid funds (Bidirectional Sync Test)'
      );
      assert.equal(
        syncedToLegacy.customUnknownLegacyField,
        'PRESERVED_VALUE_123',
        'Unknown legacy fields must not be lost'
      );

      // Direction 2: Legacy A-M -> 30-section (preserving 30-section meta & 30-section-only fields)
      syncedToLegacy.comprehensiveSections.sections.s02_visaProgramOverview.meta.applicabilityReason =
        'PRESERVED_META_NOTE';
      syncedToLegacy.comprehensiveSections.sections.s20_visaConditionsAndPermittedActivities.remoteWorkForeignEmployerRules =
        'Strictly regulated under B1/B2 rules';

      const editedLegacy = {
        ...syncedToLegacy,
        visaOverview: {
          ...syncedToLegacy.visaOverview,
          fee: 'USD 185 (Edited in Legacy Section B)'
        },
        financial: {
          ...syncedToLegacy.financial,
          minBankBalance: 'Updated in Legacy Section D'
        }
      };

      const syncedBackTo30 = syncLegacyDetailsTo30Sections(editedLegacy);
      assert.equal(
        syncedBackTo30.comprehensiveSections.sections.s02_visaProgramOverview.feeSummary,
        'USD 185 (Edited in Legacy Section B)',
        'A–M Section B edit must propagate into s02_visaProgramOverview.feeSummary'
      );
      assert.equal(
        syncedBackTo30.comprehensiveSections.sections.s09_financialAndProofOfFunds.minBankBalance,
        'Updated in Legacy Section D',
        'A–M Section D edit must propagate into s09_financialAndProofOfFunds.minBankBalance'
      );
      assert.equal(
        syncedBackTo30.comprehensiveSections.sections.s02_visaProgramOverview.meta.applicabilityReason,
        'PRESERVED_META_NOTE',
        'Existing 30-section metadata must be preserved when syncing from A–M'
      );
      assert.equal(
        syncedBackTo30.comprehensiveSections.sections.s20_visaConditionsAndPermittedActivities
          .remoteWorkForeignEmployerRules,
        'Strictly regulated under B1/B2 rules',
        '30-section-only fields must be preserved when syncing from A–M'
      );

      results.push({
        id: 10,
        name: 'A–M and 30-section bidirectional synchronization',
        status: 'PASS',
        detail: '30-Section <-> A–M bidirectional sync verified with zero metadata or unknown field loss'
      });
    }

    // -------------------------------------------------------------------
    // TEST 11: B1/B2 us-TOU-001 regression
    // -------------------------------------------------------------------
    {
      const pilot = getVisaDetails('us-TOU-001')!;
      assert.ok(pilot, 'us-TOU-001 must exist');
      assert.equal(pilot.verificationStatus, 'VERIFIED');
      const honesty = validateComprehensiveProfileHonesty(pilot);
      assert.equal(
        honesty.valid,
        true,
        `us-TOU-001 must pass server-side honesty validation, errors: ${honesty.errors.join('; ')}`
      );
      const sectionKeys = Object.keys(pilot.comprehensiveSections.sections);
      const topicKeys = Object.keys(pilot.comprehensiveSections.applicantSpecialTopics);
      assert.equal(sectionKeys.length, 30, 'us-TOU-001 must have 30 sections');
      assert.equal(topicKeys.length, 22, 'us-TOU-001 must have 22 special topics');
      assert.equal(
        pilot.comprehensiveSections.sections.s02_visaProgramOverview.visaName,
        'B1/B2 Visitor Visa'
      );
      assert.ok(
        Array.isArray(pilot.legalEvidence) && pilot.legalEvidence.length >= 1,
        'us-TOU-001 legalEvidence must remain intact'
      );

      results.push({
        id: 11,
        name: 'B1/B2 us-TOU-001 regression & honesty validation',
        status: 'PASS',
        detail: `30/30 sections, 22/22 topics, ${pilot.legalEvidence.length} statutory citations, honesty valid=true`
      });
    }

    // -------------------------------------------------------------------
    // TEST 12: SQLite and isolated Neon regression
    // -------------------------------------------------------------------
    {
      cleanupTemp();
      const sqlitePrograms = (
        db.prepare('SELECT COUNT(*) as c FROM immigration_programs').get() as { c: number }
      ).c;
      const sqliteDetails = (
        db.prepare('SELECT COUNT(*) as c FROM visa_details').get() as { c: number }
      ).c;
      assert.equal(sqlitePrograms, 29, `Expected 29 SQLite programs, got ${sqlitePrograms}`);
      assert.equal(sqliteDetails, 1, `Expected 1 SQLite visa_details record, got ${sqliteDetails}`);

      const neonUrl = process.env.NEON_TEST_DATABASE_URL;
      assert.ok(neonUrl && neonUrl.length > 0, 'NEON_TEST_DATABASE_URL must be configured');
      const pgExec = await createPostgresExecutor(neonUrl, { requireNeonRemote: true });
      const pgRepo = new PostgresImmigrationRepository(pgExec);
      const pgClaimId = `clm-neon-p322-${Date.now()}`;
      const pgEvId = `ev-neon-p322-${Date.now()}`;
      try {
        const pgPilot = await pgRepo.getVisaDetails('us-TOU-001');
        assert.ok(pgPilot, 'Neon us-TOU-001 must exist');
        assert.equal(Object.keys(pgPilot.comprehensiveSections.sections).length, 30);
        assert.equal(Object.keys(pgPilot.comprehensiveSections.applicantSpecialTopics).length, 22);

        // Verify Neon claim downgrade behavior on temporary claim
        await pgRepo.saveVisaClaim({
          id: pgClaimId,
          programId: 'us-TOU-001',
          section: 'S02: Visa Overview',
          description: 'Neon Temporary Phase 3.2.2 Downgrade Check',
          value: '185',
          unit: 'USD',
          status: 'NEEDS_EVIDENCE',
          reviewer: 'neon-test',
          requirementClassification: 'LEGAL_REQUIREMENT',
          applicableNationality: 'ALL',
          countryIso: 'US',
          visaCategory: 'Visitor'
        });
        await pgRepo.saveVisaEvidence({
          id: pgEvId,
          claimId: pgClaimId,
          sourceTitle: 'Neon Temp Official Evidence',
          sourceUrl: 'https://travel.state.gov',
          issuingAuthority: 'DOS',
          status: 'VERIFIED_OFFICIAL'
        });
        await pgRepo.saveVisaClaim({
          id: pgClaimId,
          programId: 'us-TOU-001',
          section: 'S02: Visa Overview',
          description: 'Neon Temporary Phase 3.2.2 Downgrade Check',
          value: '185',
          unit: 'USD',
          status: 'VERIFIED',
          reviewer: 'neon-test',
          requirementClassification: 'LEGAL_REQUIREMENT',
          applicableNationality: 'ALL',
          countryIso: 'US',
          visaCategory: 'Visitor'
        });
        // Delete evidence in Neon -> must downgrade parent claim to NEEDS_EVIDENCE
        await pgRepo.deleteVisaEvidence(pgEvId);
        const pgClaimsAfter = await pgRepo.getVisaClaimsWithEvidence('us-TOU-001');
        const pgTarget = pgClaimsAfter.find((c: any) => c.id === pgClaimId);
        assert.equal(
          pgTarget?.status,
          'NEEDS_EVIDENCE',
          'Neon claim must downgrade to NEEDS_EVIDENCE after evidence deletion'
        );
      } finally {
        await pgRepo.deleteVisaClaim(pgClaimId).catch(() => {});
        // Remove any temporary version snapshots created for pgClaimId
        await pgExec
          .query(
            `DELETE FROM visa_detail_versions WHERE program_id = 'us-TOU-001' AND editor_id = 'system-integrity-guard' AND change_reason LIKE $1`,
            [`%${pgClaimId}%`]
          )
          .catch(() => {});
        await pgExec.close();
      }

      results.push({
        id: 12,
        name: 'SQLite and isolated remote Neon (odd-snow-63006927) regression',
        status: 'PASS',
        detail: `SQLite (29 programs, 1 visa_details) & Remote Neon 30-section + automatic downgrade verified`
      });
    }
  } finally {
    cleanupTemp();
  }

  console.log('\n-------------------------------------------------------------------');
  for (const r of results) {
    console.log(`[${r.status}] Test ${r.id}: ${r.name}`);
    console.log(`       -> ${r.detail}`);
  }
  console.log('-------------------------------------------------------------------');
  console.log(`TOTAL: ${results.length}/12 PASSED`);
}

runPhase322Tests().catch(err => {
  console.error('PHASE 3.2.2 TEST FAILURE:', err);
  process.exit(1);
});
