import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { exportCatalogToStatic } from '../scripts/exportCatalogToStatic';
import { validateStaticCatalog } from '../scripts/validateStaticCatalog';
import { buildCatalogIndexes } from '../scripts/buildCatalogIndexes';
import { generateStaticSitemaps } from '../scripts/generateStaticSitemaps';
import { CANONICAL_15_LANG_CODES } from '../src/i18n/config';
import { CANONICAL_249_ISO2_UPPER } from '../src/schemas/catalogSchemas';
import { UNINHABITED_TERRITORY_CODES } from '../src/utils/ssrRouteRenderer';

const BASELINE_SQLITE_SHA256 = {
  db: '936faacbb233ab114dc9e90393ff2aa93d7a3ff4ca5c2231de1cf1d2f48820d4',
  wal: '72698faadb3e0d3e8b9525222fd544a82b37fd2ccb13940b64676e87856be09f',
  shm: '70d1f2ac7d8a9a06c39f06e8b5ced61b1f9fd9a6d3cccd28a223713bbfcd6b7f'
};

function sha256File(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), `visaapply-p3-${prefix}-`));
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    if (fs.statSync(s).isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ----------------------------------------------------------------------------
// 1 & 2. Deterministic & Idempotent Exporter Output
// ----------------------------------------------------------------------------
test('1 & 2. Exporter produces byte-for-byte deterministic and idempotent outputs across repeated runs', () => {
  const dirA = makeTempDir('det-a');
  const dirB = makeTempDir('det-b');
  try {
    const resA = exportCatalogToStatic({ outDir: dirA });
    const resB = exportCatalogToStatic({ outDir: dirB });

    assert.equal(resA.manifest.deterministicContentHash, resB.manifest.deterministicContentHash);
    assert.deepEqual(resA.manifest.files, resB.manifest.files);

    // Inject stale file and verify idempotent re-run cleans it and matches hash
    fs.writeFileSync(path.join(dirA, 'programs/stale-fake.json'), '[]', 'utf8');
    const resA2 = exportCatalogToStatic({ outDir: dirA });
    assert.equal(fs.existsSync(path.join(dirA, 'programs/stale-fake.json')), false);
    assert.equal(resA2.manifest.deterministicContentHash, resA.manifest.deterministicContentHash);
  } finally {
    fs.rmSync(dirA, { recursive: true, force: true });
    fs.rmSync(dirB, { recursive: true, force: true });
  }
});

// ----------------------------------------------------------------------------
// 3, 4 & 5. Legacy Program IDs, All 249 Countries & Official Source Registry Compatibility
// ----------------------------------------------------------------------------
test('3, 4 & 5. Preserves legacy program IDs, all 249 canonical ISO countries, and official source registry parity', () => {
  const dataDir = path.resolve(process.cwd(), 'data');
  const validation = validateStaticCatalog({ dataDir });
  assert.equal(validation.valid, true, `Catalog validation failed: ${JSON.stringify(validation.errors)}`);
  assert.equal(validation.summary.countriesChecked, 249);
  assert.equal(validation.summary.activeCountries, 14);
  assert.equal(validation.summary.uninhabitedTerritories, 7);
  assert.equal(validation.summary.quarantinedCountries, 228);

  // Verify every canonical 249 country JSON file exists
  for (const iso of CANONICAL_249_ISO2_UPPER) {
    assert.equal(fs.existsSync(path.join(dataDir, `countries/${iso.toLowerCase()}.json`)), true);
  }

  // Verify preserved legacy program IDs exist verbatim across country program files
  const usPrograms = JSON.parse(fs.readFileSync(path.join(dataDir, 'programs/us.json'), 'utf8')) as Array<{ programId: string }>;
  const gbPrograms = JSON.parse(fs.readFileSync(path.join(dataDir, 'programs/gb.json'), 'utf8')) as Array<{ programId: string }>;
  const aePrograms = JSON.parse(fs.readFileSync(path.join(dataDir, 'programs/ae.json'), 'utf8')) as Array<{ programId: string }>;
  const caPrograms = JSON.parse(fs.readFileSync(path.join(dataDir, 'programs/ca.json'), 'utf8')) as Array<{ programId: string }>;

  assert.ok(usPrograms.some((p) => p.programId === 'us-TOU-001'));
  assert.ok(usPrograms.some((p) => p.programId === 'us-eb2-niw'));
  assert.ok(gbPrograms.some((p) => p.programId === 'uk-skilled-worker'));
  assert.ok(aePrograms.some((p) => p.programId === 'uae-golden-visa-investor'));
  assert.ok(caPrograms.some((p) => p.programId === 'ca-express-entry'));
});

// ----------------------------------------------------------------------------
// 6 & 7. Duplicate ID Rejection & Invalid HTTPS URL Rejection
// ----------------------------------------------------------------------------
test('6 & 7. Validator rejects case-insensitive duplicate IDs and invalid/unofficial HTTPS URLs', () => {
  const tmpData = makeTempDir('dup-url');
  try {
    copyDirRecursive(path.resolve(process.cwd(), 'data'), tmpData);

    // Inject case-variant duplicate program ID in us.json
    const usPath = path.join(tmpData, 'programs/us.json');
    const usProgs = JSON.parse(fs.readFileSync(usPath, 'utf8'));
    usProgs.push({ ...usProgs[0], programId: usProgs[0].programId.toUpperCase() });
    fs.writeFileSync(usPath, JSON.stringify(usProgs, null, 2), 'utf8');

    // Inject unofficial commercial visa agency URL in official-sources/us.json
    const srcPath = path.join(tmpData, 'official-sources/us.json');
    const usSources = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    usSources[0].officialHttpsUrl = 'https://www.ivisa.com/usa-visa';
    fs.writeFileSync(srcPath, JSON.stringify(usSources, null, 2), 'utf8');

    const report = validateStaticCatalog({ dataDir: tmpData });
    assert.equal(report.valid, false);
    assert.ok(report.errors.some((e) => e.code === 'DUPLICATE_PROGRAM_ID'));
    assert.ok(report.errors.some((e) => e.code === 'INVALID_OFFICIAL_URL'));
  } finally {
    fs.rmSync(tmpData, { recursive: true, force: true });
  }
});

// ----------------------------------------------------------------------------
// 8, 9 & 10. Quarantine Preservation, Unverified & Expired Record Exclusion
// ----------------------------------------------------------------------------
test('8, 9 & 10. Expired & awaiting-verification records are preserved in quarantine and excluded from publishable collections & indexes', () => {
  const dataDir = path.resolve(process.cwd(), 'data');
  const quarantine = JSON.parse(fs.readFileSync(path.join(dataDir, 'verification/quarantine.json'), 'utf8')) as Array<{
    entityType: string;
    entityId: string;
    reasonCode: string;
    recoverable: boolean;
    preservedPayload: Record<string, unknown>;
  }>;

  // Expired PT real estate golden visa must be preserved in quarantine, NOT in data/programs/pt.json
  const expiredPt = quarantine.find((q) => q.entityId === 'pt-golden-visa-expired-realestate');
  assert.ok(expiredPt);
  assert.equal(expiredPt.reasonCode, 'EXPIRED_PROGRAM');
  assert.equal(expiredPt.recoverable, true);
  assert.ok(expiredPt.preservedPayload);

  const ptProgs = JSON.parse(fs.readFileSync(path.join(dataDir, 'programs/pt.json'), 'utf8')) as Array<{ programId: string }>;
  assert.equal(ptProgs.some((p) => p.programId === 'pt-golden-visa-expired-realestate'), false);

  // Verify injecting an unverified program into data/programs/pt.json fails validation
  const tmpData = makeTempDir('unverified-prog');
  try {
    copyDirRecursive(dataDir, tmpData);
    const tmpPtPath = path.join(tmpData, 'programs/pt.json');
    const tmpPtProgs = JSON.parse(fs.readFileSync(tmpPtPath, 'utf8'));
    tmpPtProgs.push({
      ...tmpPtProgs[0],
      programId: 'PT-WORK-UNVERIFIED-DRAFT',
      verificationStatus: 'AWAITING_OFFICIAL_VERIFICATION',
      publicationStatus: 'QUARANTINED',
      lastVerifiedDate: null
    });
    fs.writeFileSync(tmpPtPath, JSON.stringify(tmpPtProgs, null, 2), 'utf8');

    const report = validateStaticCatalog({ dataDir: tmpData });
    assert.equal(report.valid, false);
    assert.ok(report.errors.some((e) => e.code === 'INELIGIBLE_PROGRAM_IN_PUBLISHABLE_DIR'));
  } finally {
    fs.rmSync(tmpData, { recursive: true, force: true });
  }
});

// ----------------------------------------------------------------------------
// 11, 12, 13 & 14. Conflicting Claims, PII/Secrets, Phase 3.2 Fixtures & Evidence Linkage
// ----------------------------------------------------------------------------
test('11, 12, 13 & 14. Validator rejects conflicting claims, PII/secrets, deleted Phase 3.2 fixtures, and broken evidence links', () => {
  const dataDir = path.resolve(process.cwd(), 'data');

  // 11 & 14: Conflicting claim + broken evidence link
  const tmpConflict = makeTempDir('conflict');
  try {
    copyDirRecursive(dataDir, tmpConflict);
    const claimsPath = path.join(tmpConflict, 'verification/claims.json');
    const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
    claims[0].verificationStatus = 'CONFLICTING';
    claims[0].evidenceIds.push('EV-DEAD00000001');
    fs.writeFileSync(claimsPath, JSON.stringify(claims, null, 2), 'utf8');

    const report = validateStaticCatalog({ dataDir: tmpConflict });
    assert.equal(report.valid, false);
    assert.ok(report.errors.some((e) => e.code === 'CONFLICTING_CLAIM_ON_PUBLISHED_PROGRAM'));
    assert.ok(report.errors.some((e) => e.code === 'DANGLING_EVIDENCE_REF'));
  } finally {
    fs.rmSync(tmpConflict, { recursive: true, force: true });
  }

  // 12 & 13: PII/secret leak + deleted Phase 3.2 fixture
  const tmpLeak = makeTempDir('pii-fixture');
  try {
    copyDirRecursive(dataDir, tmpLeak);
    const chgPath = path.join(tmpLeak, 'changelog/latest.json');
    const chg = JSON.parse(fs.readFileSync(chgPath, 'utf8'));
    chg[0].title = 'Secret postgresql://admin:secret@db.neon.tech/prod email leak@example.org';
    fs.writeFileSync(chgPath, JSON.stringify(chg, null, 2), 'utf8');

    const usPath = path.join(tmpLeak, 'programs/us.json');
    const usProgs = JSON.parse(fs.readFileSync(usPath, 'utf8'));
    usProgs.push({ ...usProgs[0], programId: 'test-phase-3-2-prog' });
    fs.writeFileSync(usPath, JSON.stringify(usProgs, null, 2), 'utf8');

    const report = validateStaticCatalog({ dataDir: tmpLeak });
    assert.equal(report.valid, false);
    assert.ok(report.errors.some((e) => e.code === 'PROHIBITED_PUBLIC_DATA'));
    assert.ok(report.errors.some((e) => e.code === 'FORBIDDEN_PHASE32_FIXTURE'));
  } finally {
    fs.rmSync(tmpLeak, { recursive: true, force: true });
  }
});

// ----------------------------------------------------------------------------
// 15. Markdown Frontmatter Validation
// ----------------------------------------------------------------------------
test('15. Validator enforces editorial Markdown frontmatter and blocks drafts placed in editorial/published/', () => {
  const tmpEd = makeTempDir('editorial');
  try {
    copyDirRecursive(path.resolve(process.cwd(), 'data'), tmpEd);
    fs.writeFileSync(
      path.join(tmpEd, 'editorial/published/sneaky-draft.md'),
      `---\nschemaVersion: "2.0.0"\nslug: "sneaky-draft"\nlanguage: "en"\ntitle: "Sneaky Draft"\ndescription: "Should fail"\nofficialReferences: []\npublicationDate: null\nupdatedDate: "2026-11-23"\neditorialStatus: "draft"\n---\nBody\n`,
      'utf8'
    );

    const report = validateStaticCatalog({ dataDir: tmpEd });
    assert.equal(report.valid, false);
    assert.ok(report.errors.some((e) => e.code === 'EDITORIAL_STATUS_DIRECTORY_MISMATCH'));
  } finally {
    fs.rmSync(tmpEd, { recursive: true, force: true });
  }
});

// ----------------------------------------------------------------------------
// 16, 17, 18, 19 & 20. 15-Language Indexes, Fallback Honesty, Compact Routes & Content-Hash Stability
// ----------------------------------------------------------------------------
test('16-20. Index builder emits all 15 languages with honest EN fallback, compact routes, no 61,752 dump, and stable content hashes', () => {
  const outA = makeTempDir('idx-a');
  const outB = makeTempDir('idx-b');
  try {
    const resA = buildCatalogIndexes({ outDir: outA });
    const resB = buildCatalogIndexes({ outDir: outB });

    // 20. Content-hash stability
    assert.equal(resA.manifest.deterministicBuildHash, resB.manifest.deterministicBuildHash);
    assert.equal(resA.manifest.indexes.countries.filePath, resB.manifest.indexes.countries.filePath);
    assert.equal(resA.manifest.indexes.programs.filePath, resB.manifest.indexes.programs.filePath);

    // 16. All 15 language search indexes present
    assert.equal(resA.manifest.counts.languageSearchIndexes, 15);
    for (const lang of CANONICAL_15_LANG_CODES) {
      const entry = resA.manifest.indexes.searchByLanguage[lang];
      assert.ok(entry, `Missing search index for language ${lang}`);
      const fullPath = path.join(outA, entry.filePath);
      assert.equal(fs.existsSync(fullPath), true);

      // 17. Partial translation fallback honesty
      const payload = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      assert.equal(payload.translationCoverage.uiShellTranslated, true);
      assert.equal(payload.translationCoverage.legalProgramRulesLanguage, 'en');
      if (lang === 'en') {
        assert.equal(payload.translationCoverage.hasVerifiedNativeLegalTranslation, true);
        assert.equal(payload.translationCoverage.fallbackNotice, null);
      } else {
        assert.equal(payload.translationCoverage.hasVerifiedNativeLegalTranslation, false);
        assert.ok(typeof payload.translationCoverage.fallbackNotice === 'string' && payload.translationCoverage.fallbackNotice.length > 10);
        assert.ok(payload.programs.every((p: { contentLanguage: string; isFallbackContent: boolean }) => p.contentLanguage === 'en' && p.isFallbackContent === true));
      }
    }

    // 18 & 19. Compact route lookup & no 61,752-route monolithic download
    assert.equal(resA.manifest.performanceSummary.monolithic61752RoutesAvoided, true);
    assert.ok(resA.manifest.indexes.routes.bytes < 10_000, `Compact route index unexpectedly large: ${resA.manifest.indexes.routes.bytes} bytes`);
    assert.ok(resA.manifest.performanceSummary.initialCoreIndexGzipBytes < 50_000, `Initial core gzip payload too large: ${resA.manifest.performanceSummary.initialCoreIndexGzipBytes} bytes`);

    // Quarantined expired program & draft articles must NOT appear in built program/editorial indexes
    const progIndexJson = fs.readFileSync(path.join(outA, resA.manifest.indexes.programs.filePath), 'utf8');
    assert.equal(progIndexJson.includes('pt-golden-visa-expired-realestate'), false);
    assert.equal(progIndexJson.includes('test-phase-3-2-prog'), false);

    const editorialIndexJson = fs.readFileSync(path.join(outA, resA.manifest.indexes.editorial.filePath), 'utf8');
    assert.equal(editorialIndexJson.includes('ga-to-fj-student'), false);
    assert.equal(editorialIndexJson.includes('in-to-ca-tourist'), true);
  } finally {
    fs.rmSync(outA, { recursive: true, force: true });
    fs.rmSync(outB, { recursive: true, force: true });
  }
});

// ----------------------------------------------------------------------------
// 21 & 22. Valid-Only Sitemap Exclusion, Canonical & Hreflang Consistency
// ----------------------------------------------------------------------------
test('21 & 22. Valid-only static sitemaps exclude unverified/expired/draft/uninhabited pages and enforce canonical + hreflang consistency', () => {
  const smOut = makeTempDir('sitemaps');
  try {
    const report = generateStaticSitemaps({ outDir: smOut });
    assert.equal(report.valid, true, `Static sitemap validation errors: ${JSON.stringify(report.validationErrors)}`);
    assert.equal(report.legacyComparison.legacySitemapFilesPreserved, true);
    assert.ok(report.totals.substantiveUrlsEmitted > 0 && report.totals.substantiveUrlsEmitted < 500);

    const allXml = report.sitemapFiles
      .map((sf) => fs.readFileSync(path.join(smOut, sf.fileName), 'utf8'))
      .join('\n');

    // Excluded items must never appear
    assert.equal(allXml.includes('pt-golden-visa-expired-realestate'), false);
    assert.equal(allXml.includes('ga-to-fj-student'), false);
    assert.equal(allXml.includes('ga-to-fj-work'), false);
    assert.equal(allXml.includes('jp-to-ae-business'), false);
    for (const uCode of UNINHABITED_TERRITORY_CODES) {
      assert.equal(allXml.includes(`/immigration/${uCode}<`), false);
    }

    // Verified substantive items MUST appear (canonical lowercase normalized URLs)
    assert.equal(allXml.includes('https://www.visaapply.org/immigration/us'), true);
    assert.equal(allXml.includes('https://www.visaapply.org/visa/us/us-tou-001'), true);
    assert.equal(allXml.includes('https://www.visaapply.org/in-to-ca-tourist'), true);

    // Multi-language route `/` must emit all 15 languages + x-default
    const coreXml = fs.readFileSync(path.join(smOut, 'sitemap-static-core.xml'), 'utf8');
    for (const lang of CANONICAL_15_LANG_CODES) {
      assert.equal(coreXml.includes(`hreflang="${lang}"`), true, `Missing hreflang="${lang}" in core sitemap`);
    }
    assert.equal(coreXml.includes('hreflang="x-default"'), true);
  } finally {
    fs.rmSync(smOut, { recursive: true, force: true });
  }
});

// ----------------------------------------------------------------------------
// 23. Export Manifest Count Reconciliation
// ----------------------------------------------------------------------------
test('23. Export manifest counts reconcile cleanly with validated static catalog on disk', () => {
  const dataDir = path.resolve(process.cwd(), 'data');
  const exportManifest = JSON.parse(fs.readFileSync(path.join(dataDir, 'export_manifest.json'), 'utf8'));
  const validation = validateStaticCatalog({ dataDir });

  assert.equal(validation.valid, true);
  assert.equal(exportManifest.summary.countriesExported, validation.summary.countriesChecked);
  assert.equal(exportManifest.summary.activeCountries, validation.summary.activeCountries);
  assert.equal(exportManifest.summary.quarantinedCountries, validation.summary.quarantinedCountries);
  assert.equal(exportManifest.summary.uninhabitedTerritories, validation.summary.uninhabitedTerritories);
  assert.equal(exportManifest.summary.officialSourcesExported, validation.summary.officialSourcesChecked);
  assert.equal(exportManifest.summary.programsExportedPublished, validation.summary.programsChecked);
  assert.equal(exportManifest.summary.visaDetailsExported, validation.summary.visaDetailsChecked);
  assert.equal(exportManifest.summary.claimsExported, validation.summary.claimsChecked);
  assert.equal(exportManifest.summary.evidenceExported, validation.summary.evidenceChecked);
  assert.equal(exportManifest.summary.quarantineRecordsTotal, validation.summary.quarantineRecordsChecked);
  assert.equal(exportManifest.summary.changelogEntriesExported, validation.summary.changelogEntriesChecked);
  assert.equal(exportManifest.summary.editorialPublishedExported, validation.summary.editorialPublishedChecked);
  assert.equal(exportManifest.summary.editorialDraftsExported, validation.summary.editorialDraftsChecked);
});

// ----------------------------------------------------------------------------
// 24. Original SQLite Immutability & Live DB Safety Guard
// ----------------------------------------------------------------------------
test('24. Exporter refuses live production SQLite path and leaves DB, WAL, and SHM SHA-256 checksums untouched', () => {
  assert.throws(
    () =>
      exportCatalogToStatic({
        backupDbPath: path.resolve(process.cwd(), 'data_db/immigration_hub.db'),
        dryRun: true
      }),
    /SAFETY_GUARD_VIOLATION/
  );

  assert.equal(sha256File(path.resolve(process.cwd(), 'data_db/immigration_hub.db')), BASELINE_SQLITE_SHA256.db);
  assert.equal(sha256File(path.resolve(process.cwd(), 'data_db/immigration_hub.db-wal')), BASELINE_SQLITE_SHA256.wal);
  assert.equal(sha256File(path.resolve(process.cwd(), 'data_db/immigration_hub.db-shm')), BASELINE_SQLITE_SHA256.shm);
});
