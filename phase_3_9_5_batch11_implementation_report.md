# PHASE 3.9.5 — PRIORITY 2 BATCH 11 IMPLEMENTATION REPORT
## VisaApply.org — Global Immigration Intelligence Platform
### 10 Evidence-Backed Immigration Pathways | 300 Profile Sections | 220 Special Topics

**Date:** 2026-11-13  
**Phase:** Phase 3.9.5 — Priority 2 Batch 11 Implementation  
**Additional Budget Spent:** ₹0 (Zero paid APIs, services, dependencies, or infrastructure)  
**Previous Completed Baseline:** 120 / 210 Priority 2 pathways (Batches 0–10)  
**Batch 11 Implemented:** 10 genuine pathways (`p2-cand-us-n400`, `p2-cand-gb-seasonal`, `p2-cand-nz-aip`, `p2-cand-sg-dp`, `p2-cand-de-18d-research`, `p2-cand-fr-vpf`, `p2-cand-ie-stamp1g`, `p2-cand-hk-gep`, `p2-cand-jp-pr`, `p2-cand-cl-definitiva`)  
**Updated Priority 2 Progress:** **130 / 210 completed** (`61.90%`; `3,900` cumulative section entries)  
**Remaining Original Target Slots:** **80** (`33` verified genuine candidates remain in the Phase 3.9.3 pool; `47` additional pathways require future primary-source curation; the `90` rejected synthetic placeholders `p2-queue-backlog-121..210` are permanently retired and not restored)  
**Production Deployment / Database Migration:** NOT EXECUTED (Strictly prohibited)  

---

## 1. EXECUTIVE SUMMARY & PRE-IMPLEMENTATION BACKUP

Phase 3.9.5 implements the **10 staged and preflight-approved Priority 2 Batch 11 candidates** from `phase_3_9_3_proposed_batch11_candidates.json` using the authoritative evidence and gap disclosures verified in Phase 3.9.4 (`phase_3_9_4_candidate_approval_matrix.csv`, `phase_3_9_4_source_evidence_verification.csv`, and `phase_3_9_4_claim_readiness_audit.csv`).

### Pre-Implementation Backup Verification
Before modifying any project file, a focused pre-implementation recovery archive was created and verified:
- **Backup Archive Path:** `/app/applet/backup_phase_3_9_5_batch11.tar.gz`
- **Archive Size:** `113,055` bytes (`110.4 KB`)
- **SHA-256 Checksum:** `62d7aef0c86aaa918914847d09b647af6d994f4286fbc24330193e352dc776f4`
- **Archive Integrity:** Verified readable via `tar -tzf /app/applet/backup_phase_3_9_5_batch11.tar.gz` (`14` critical files backed up, including `src/data/priority2AuditData.ts`, `src/pages/GlobalVisaCoverageAuditPage.tsx`, `src/data/globalImmigrationHubData.ts`, and all Phase 3.9.3 / 3.9.4 candidate and approval artifacts).

---

## 2. REUSED ARCHITECTURE, SCHEMA & PUBLIC SANITIZATION COMPONENTS

No parallel data architectures, duplicate schemas, or new npm dependencies were introduced. Phase 3.9.5 reuses:
1. **`src/data/priority2AuditData.ts` (`Priority2PathwayAudit` & `PRIORITY2_BATCH11_COMBINATIONS`):**
   - Added optional `legalInstrumentType?: string` to `Priority2PathwayAudit` to preserve explicit legal classification distinctions across visa, residence permit, derivative family pass, post-study permission, permanent residence, and non-visa citizenship/naturalization applications.
   - Appended `...PRIORITY2_BATCH11_COMBINATIONS` (`10` pathways) to `PRIORITY2_COMPLETED_PATHWAYS` (`130` completed total).
   - Permanently retired the `for (let i = 0; i < 90; i++)` synthetic placeholder generator (`p2-queue-backlog-121..210`) from `PRIORITY2_FULL_QUEUE` so synthetic placeholders are never represented as valid pathways.
   - Added `getPublicPriority2PathwayView(pathwayId: string)` to strip internal audit/reviewer fields (`correctiveClassificationNotes`) and block any `AWAITING_VERIFICATION` or `NOT_OFFERED` pathway from public projection.
2. **`src/types/visaComprehensiveProfile.ts` (`sanitizeVisaDetailsForPublic`):**
   - Reused existing public-view sanitizer that strips `reviewerNotes`, `internalReviewNotes`, `correctiveClassificationNotes`, `reviewer`, and `editorId`, filters out any claim with `isQuarantined === true` or `verificationStatus` in `['QUARANTINED', 'REJECTED']`, and prevents any unverified claim from rendering as `VERIFIED`.
3. **`src/pages/GlobalVisaCoverageAuditPage.tsx`:**
   - Added the `BATCH11_395` audit tab (`Batch 11 Global (10)`) and `batch11TestResults` regression suite while preserving all historical tabs (`Batch 10` through `Pilot Batch 0` and `Priority 1`).

---

## 3. BATCH 11 PATHWAY SUMMARY TABLE (10 PATHWAYS)

| Slot | Pathway ID | Country | Official Pathway Name | Category | Legal Instrument Classification | Verification Status | Published Claims | Quarantined Claims | Primary Official Sovereign URL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | `p2-cand-us-n400` | United States (`US`) | Application for Naturalization (Form N-400) | Citizenship / Naturalization | Non-Visa Citizenship / Naturalization Application | `PARTIALLY_VERIFIED` | 84 | 6 | `https://www.uscis.gov/citizenship/apply-for-naturalization` |
| **2** | `p2-cand-gb-seasonal` | United Kingdom (`GB`) | Seasonal Worker Visa (Horticulture & Poultry) | Seasonal / Temporary Work | Temporary Sponsored Work Visa | `VERIFIED` | 86 | 4 | `https://www.gov.uk/seasonal-worker-visa` |
| **3** | `p2-cand-nz-aip` | New Zealand (`NZ`) | Active Investor Plus Visa (Growth & Balanced) | Investor / Business Residency | Resident Visa (Investment-Based Residence) | `VERIFIED` | 87 | 3 | `https://www.immigration.govt.nz/visas/active-investor-plus-visa/` |
| **4** | `p2-cand-sg-dp` | Singapore (`SG`) | Dependant’s Pass (DP) | Family / Dependant Permission | Derivative Family / Dependant Pass | `VERIFIED` | 89 | 1 | `https://www.mom.gov.sg/passes-and-permits/dependants-pass` |
| **5** | `p2-cand-de-18d-research` | Germany (`DE`) | Research Residence Permit (`Aufenthaltserlaubnis § 18d AufenthG`) | Research / Work Residence | Statutory Residence Permit for Research | `VERIFIED` | 89 | 1 | `https://www.gesetze-im-internet.de/aufenthg_2004/__18d.html` |
| **6** | `p2-cand-fr-vpf` | France (`FR`) | `Carte de séjour « vie privée et familiale »` | Family / Private Life Residence | Temporary / Multi-Year Family & Private-Life Residence Permit | `PARTIALLY_VERIFIED` | 81 | 9 | `https://www.service-public.gouv.fr/particuliers/vosdroits/F2209` |
| **7** | `p2-cand-ie-stamp1g` | Ireland (`IE`) | Third Level Graduate Programme (Stamp 1G) | Student / Post-Study Residence | Post-Study Residence & Graduate Work Permission | `VERIFIED` | 87 | 3 | `https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/third-level-graduate-programme/` |
| **8** | `p2-cand-hk-gep` | Hong Kong (`HK`) | General Employment Policy (GEP — `一般就業政策`) | Skilled Employment | Sponsored Skilled Employment / Entrepreneur Arrangement | `VERIFIED` | 89 | 1 | `https://www.immd.gov.hk/eng/services/visas/GEP.html` |
| **9** | `p2-cand-jp-pr` | Japan (`JP`) | Permission for Permanent Residence (`永住許可`) | Permanent Residence / Settlement | Permanent Residence Permission (`永住者`) | `PARTIALLY_VERIFIED` | 85 | 5 | `https://www.moj.go.jp/isa/applications/procedures/16-4.html` |
| **10** | `p2-cand-cl-definitiva` | Chile (`CL`) | `Residencia Definitiva` (`Ley N° 21.325`) | Permanent Residence / Settlement | Permanent Residence Permit (`Residencia Definitiva`) | `PARTIALLY_VERIFIED` | 84 | 6 | `https://serviciomigraciones.cl/residencia-definitiva/` |
| **Total** | **10 Unique IDs** | **10 Jurisdictions** | **10 Genuine Pathways** | **7 Distinct Categories** | **Zero Collision with 120 P2 + 142 P1** | **6 VERIFIED / 4 PARTIAL** | **861** | **39** | **18 HTTP 200 Sources + 1 Quarantined 403 Subpage** |

---

## 4. CANDIDATE-BY-CANDIDATE IMPLEMENTATION NOTES & RULE COMPLIANCE

### A. `p2-cand-us-n400` — United States: Apply for Naturalization, Form N-400 (`PARTIALLY_VERIFIED`)
- **Non-Visa Classification Enforced:** Explicitly labeled as a `Non-Visa Citizenship / Naturalization Application` requiring existing Lawful Permanent Resident (Green Card) status or qualifying military service. Visa-only sections (`S06`, `S13`, `S14`, `S15`, `S16`, `S21`, `S22`, `S23`, `S24`, `S26`) and visa-only special topics (`T09`, `T10`, `T19`) are marked `NOT_APPLICABLE`.
- **Statutory Separation Enforced:** Procedural filing rules (`INA § 334`, `8 U.S.C. § 1445`, `8 CFR Part 334`, Form N-400 instructions, 90-day early filing window under `8 CFR § 334.2(b)`) are separated from substantive eligibility under `INA § 316` (`8 U.S.C. § 1427`, 5-year LPR / 30-month physical presence / 3-month state residence), `INA § 319(a)` (`8 U.S.C. § 1430`, 3-year U.S. citizen spouse track / 18-month physical presence), `INA § 312` (`8 U.S.C. § 1423`, English and civics testing & `50/20`, `55/15`, `65/20`, `N-648` exceptions), and `INA § 337` (Oath of Allegiance).
- **Quarantine Enforcement:** Because `https://www.uscis.gov/forms/filing-fees` returned Akamai EdgeSuite HTTP 403 on `2026-11-13` and field-office processing times are dynamic, all 6 claims in Section 17 (`CLM-US-B11-S17-1..3`) and Section 18 (`CLM-US-B11-S18-1..3`) are marked `AWAITING_VERIFICATION` and strictly quarantined (`is_quarantined=true`).

### B. `p2-cand-gb-seasonal` — United Kingdom: Seasonal Worker Visa (`VERIFIED`)
- **Statutory & Operational Rules:** Implemented under *UK Immigration Rules Appendix Temporary Work – Seasonal Worker* (`https://www.gov.uk/seasonal-worker-visa` and `/eligibility`, HTTP 200). Captures the **£319** application fee, **£1,270** maintenance requirement held for 28 consecutive days (unless certified by an A-rated sponsor), **3-week** overseas decision SLA, **Certificate of Sponsorship (CoS)** requirement, sector-specific stay limits (**up to 6 months** for horticulture vs **2 October to 31 December** for poultry with a **15 November** application cutoff), entry up to **14 days** before job start date, and explicit prohibitions on permanent jobs, second jobs, public funds, dependants (`S24` = `NOT_APPLICABLE`), and settlement.
- **Quarantine Enforcement:** Legacy T5 naming (`CLM-GB-B11-S02-3` = `EXPIRED`) and unpublished annual numerical quota caps in Section 26 (`CLM-GB-B11-S26-1..3` = `AWAITING_VERIFICATION`) are quarantined.

### C. `p2-cand-nz-aip` — New Zealand: Active Investor Plus Visa (`VERIFIED`)
- **Statutory & Operational Rules:** Implemented from `https://www.immigration.govt.nz/visas/active-investor-plus-visa/` (HTTP 200). Separates the **Growth category** (`NZD $5,000,000` minimum over 36 months; **21 days** physical presence in NZ over 36 months) and **Balanced category** (`NZD $10,000,000` minimum over 60 months; **105 days** physical presence in NZ over 60 months, reducible by **14 days** per additional `NZD $1M` in Growth investments up to a 42-day reduction: `NZD $11M = 91 days`, `NZD $12M = 77 days`, `NZD $13M = 63 days`). Captures the **NZD $27,470** starting fee, **~4-month** Approval in Principle SLA (80% of applications), and **6-month** transfer window (plus one 6-month extension).
- **Section 6.C Quarantine Enforcement:** While the headline 21-day and 105/91/77/63-day physical-presence thresholds are verified directly on `immigration.govt.nz`, INZ Operational Manual BN2 sub-clause partial-day counting and exceptional deferral mechanics (`CLM-NZ-B11-S22-3`), post-AIP final eVisa issuance SLA (`CLM-NZ-B11-S17-3`), and the fee/levy split (`CLM-NZ-B11-S18-3`) are held in `AWAITING_VERIFICATION` & quarantined (`T16` and `S22` marked `PARTIALLY_VERIFIED`).

### D. `p2-cand-sg-dp` — Singapore: Dependant’s Pass (`VERIFIED`)
- **Derivative Permission Classification:** Explicitly classified as a `Derivative Family / Dependant Pass (Not an Independent Work Visa)` tied to an eligible Employment Pass, S Pass, EntrePass, or ONE Pass principal (`https://www.mom.gov.sg/passes-and-permits/dependants-pass`, `/eligibility`, `/key-facts`, HTTP 200, updated 9 July 2026).
- **Eligibility & Exclusions:** Captures the **SGD 6,000** minimum fixed monthly salary for EP/S Pass principals, EntrePass Year-1 renewal conditions (**SGD 100,000** annual business spending + **3 LQS** or **1 PME**), eligibility limited to legally married spouses and unmarried children under 21 (common-law spouses, stepchildren, and disabled children >=21 must use LTVP; Work Permit holders cannot sponsor DP), HPB diphtheria/measles vaccination requirement for foreign-born children <=12, **SGD 105** application + **SGD 225** issuance fee (+ conditional **SGD 30** MJV), and **3-week** processing SLA for EP/S Pass dependants (**8 weeks** for EntrePass/PEP).
- **Quarantine Enforcement:** Granular Letter of Consent (LOC) business-owner rules vs work-pass conversion rules on the separate `/working-in-singapore` subpage (`CLM-SG-B11-S09-3`) are quarantined.

### E. `p2-cand-de-18d-research` — Germany: Research Residence Permit, `§ 18d AufenthG` (`VERIFIED`)
- **Statutory Basis & Independence:** Implemented directly from federal German statutory text (`https://www.gesetze-im-internet.de/aufenthg_2004/__18d.html` and `https://www.gesetze-im-internet.de/aufenthv/__45.html`, HTTP 200), completely independent of France `p2-fr-chercheur`.
- **Cost-Assumption Undertaking Precision:** Accurately reflects `§ 18d Abs. 1 Nr. 2` and `Abs. 2 AufenthG`: a written cost-assumption undertaking (`Kostenübernahmeerklärung`) for public return/stay costs up to 6 months after expiry **is still required** unless the research activity is predominantly financed from public funds (`§ 18d Abs. 1 Satz 2`), and is **waived** (`soll abgesehen werden`) when the research organization is officially recognized by BAMF (`§ 18d Abs. 2`).
- **Validity, Fees & Work Rights:** Captures the **>=1-year** standard validity (**>=2 years** under EU mobility programs, or project duration if shorter), **60-day** statutory decision deadline for recognized research bodies (`§ 18d Abs. 4`), right to conduct research and teaching (`§ 18d Abs. 5`), `§ 45 AufenthV` fees (**EUR 100** initial / **EUR 96** extension >3m / **EUR 93** change of purpose), and qualification as a `Fachkraft` toward `§ 18c AufenthG` settlement. Local municipal `Ausländerbehörde` appointment wait times (`CLM-DE-B11-S17-3`) are quarantined.

### F. `p2-cand-fr-vpf` — France: `Carte de séjour « vie privée et familiale »` (`PARTIALLY_VERIFIED`)
- **Statutory Basis & Distinction:** Implemented from `https://www.service-public.gouv.fr/particuliers/vosdroits/F2209` (HTTP 200, `Vérifié le 06 novembre 2026`, `CESEDA Articles L.423-1 to L.423-23, L.433-4`), strictly distinct from `Visiteur` (`F302`) and `Salarié` (`F15898`).
- **Verified Rules:** Captures **1-year** initial validity, **ANEF** online filing window (**4 to 2 months** before expiry), **EUR 225** fiscal stamp fee (**EUR 25** stamp duty + **EUR 200** tax), authorization to exercise any salaried or professional activity (`autorise à travailler`), **2-year** multi-year renewal (**3 years** on second renewal for spouses of French nationals or parents of French children), and **3-year** path to a 10-year `Carte de résident`.
- **Quarantine Enforcement:** `9` claims covering undocumented prefecture processing SLAs (`CLM-FR-B11-S17-1..3`), the 1968 Franco-Algerian Agreement (`CLM-FR-B11-S04-2`, `CLM-FR-B11-S30-2`), bilateral migration-flow accords (`CLM-FR-B11-S04-3`, `CLM-FR-B11-S09-3`, `CLM-FR-B11-S30-3`), and non-spouse sub-branches (`CLM-FR-B11-S03-3`) are quarantined.

### G. `p2-cand-ie-stamp1g` — Ireland: Third Level Graduate Programme, Stamp 1G (`VERIFIED`)
- **Post-Study Permission Classification:** Implemented from `https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/third-level-graduate-programme/` (HTTP 200). Strictly classified as an onshore post-study graduate permission (`Stamp 1G`) distinct from `Stamp 4` (`p2-ie-stamp4`) and Critical Skills Employment Permit (`p2-ie-csep`).
- **Verified Rules:** Captures eligibility for non-EEA graduates holding a valid `Stamp 2` IRP and an **NFQ Level 8–10** award from a recognized Irish awarding body, **6-month** application deadline after final results, **12 months** for Level 8 graduates vs **up to 24 months (12 + 12)** for Level 9+ postgraduates, **8-year** total student/graduate permission cap, **2-award** lifetime limit, **40 hours/week** employment right (self-employment prohibited), **EUR 300** IRP registration fee, and mandatory Irish medical insurance. Live ISD registration processing times (`CLM-IE-B11-S17-1..3`) are quarantined.

### H. `p2-cand-hk-gep` — Hong Kong: General Employment Policy, GEP (`VERIFIED`)
- **Statutory Basis & Distinction:** Implemented from `https://www.immd.gov.hk/eng/services/visas/GEP.html` (HTTP 200, rev. 15 Apr 2026) and `https://www.immd.gov.hk/eng/specifiedschemes.html` (HTTP 200). Distinct from QMAS (`p2-hk-qmas`), TTPS (`p2-hk-ttps`), and IANG (`p2-hk-iang`).
- **Verified Rules:** Captures the non-quota professional and entrepreneur streams, nationality exclusions (Afghanistan, Cuba, DPRK; Mainland Chinese residents require ASMTP unless holding overseas PR or >=1 year overseas residence), **4-week** processing SLA after complete documentation, **3+3+2 year** stay pattern (**2+6 years** top-tier track for `>=HKD 2,000,000` assessable salary), and Specified Scheme two-stage fee schedule (**HKD 600** non-refundable application fee + **HKD 1,300** issuance >180d or **HKD 600** <=180d). Uncodified numerical initial salary floor claims (`CLM-HK-B11-S05-3`) are quarantined.

### I. `p2-cand-jp-pr` — Japan: Permission for Permanent Residence, `永住許可` (`PARTIALLY_VERIFIED`)
- **Statutory & Guideline Basis:** Implemented from `https://www.moj.go.jp/isa/applications/procedures/16-4.html` (HTTP 200, updated 27 Oct 2026) and `https://www.moj.go.jp/isa/applications/resources/nyukan_nyukan50.html` (HTTP 200, revised 24 Feb 2026 / `令和８年２月２４日改訂`).
- **Verified Rules:** Captures `ICRRA Article 22(2)` requirements (good conduct, independent livelihood, and national interest including punctual tax/pension/health insurance payments and holding the longest period of stay, with a **3-year** period treated as longest through **31 March 2027** per Guideline Note 1), residence-duration tracks (**10 consecutive years** with `>=5 years` work/residence excluding `技能実習` and `特定技能１号`; **3 years** marriage + **1 year** in Japan for spouses; **1 year** for children; **5 years** for `定住者`/refugees; **3 years** for `>=70 points` HSP; **1 year** for `>=80 points` HSP or `J-Skip`), **¥100,000** revenue-stamp fee upon approval (`令和8年10月1日以降に受付`; **¥0** for Art. 22-2 acquisition by birth), Guarantor (`身元保証人`) requirement, and unrestricted employment rights.
- **Quarantine Enforcement:** `5` claims covering undocumented processing times on `16-4.html` (`CLM-JP-B11-S17-1..2`), the unverified external *Guidelines on Contribution to Japan* (`CLM-JP-B11-S03-3`), uncodified numerical household JPY income floors (`CLM-JP-B11-S05-3`), and superseded pre-Oct 2026 stamp fees (`CLM-JP-B11-S18-3` = `EXPIRED`) are quarantined.

### J. `p2-cand-cl-definitiva` — Chile: `Residencia Definitiva` (`PARTIALLY_VERIFIED`)
- **Statutory Basis & Distinction:** Implemented from `https://serviciomigraciones.cl/residencia-definitiva/` (HTTP 200, updated 17 Jul 2026) and `https://serviciomigraciones.cl/aranceles-migratorios/` (HTTP 200), under *Ley de Migración y Extranjería N° 21.325* (`Arts. 64, 78–83, 88`) and *Decreto Supremo N° 296* (`Arts. 65, 66`). Distinct from `Residencia Temporal — Jubilado y Rentista` (`p2-cl-rentista`).
- **Verified Rules:** Captures the **24-month** standard `Residencia Temporal` requirement (**12 months** reduced track under `Art. 79 Ley 21.325` & `Art. 66 DS 296` for Chilean family links; or **24 / 30 / 36 / 48 months** tiered by cumulative absences `<=2m`, `>2–6m`, `>6–12m`, `>12m` under `Art. 65 DS 296`), online filing via `trámites.serviciomigraciones.cl` with `ClaveÚnica` within the **last 90 to 10 days** before permit expiry, **40% UTM** fee (**~27,900 CLP**, exempt/**0 CLP** for minors `<18` and spouses/civil partners of Chileans), **60-day** `Completa antecedentes` cure window (`Art. 88`), **30-day** Registro Civil `Cédula` registration, and **2-year** abroad tacit revocation rule (`Art. 83`, with 1-time 2-year consular extension requested within last 60 days).
- **Quarantine Enforcement:** `6` claims covering undocumented SERMIG processing times (`CLM-CL-B11-S17-1..3`), the unverified raw *Decreto Supremo N° 177* subcategory transition matrix (`CLM-CL-B11-S03-3`), uncodified *Ministerio de Desarrollo Social* CLP income tables (`CLM-CL-B11-S05-3`), and superseded *DL N° 1.094* rules (`CLM-CL-B11-S02-3` = `EXPIRED`) are quarantined.

---

## 5. 300 PROFILE SECTION STATUS SUMMARY (`10 × 30`)

Every Batch 11 pathway was evaluated across all **30 standard profile sections (`S01`–`S30`)**:

| Section Verification Status | Count | Percentage | Notes |
| :--- | :---: | :---: | :--- |
| **`VERIFIED`** | **243** | `81.00%` | Fully backed by live HTTP 200 sovereign evidence |
| **`PARTIALLY_VERIFIED`** | **18** | `6.00%` | Core rule verified; specific sub-clause or subpage quarantined (`US` N/A, `GB` S02, `NZ` S17/S18/S22, `SG` S09, `DE` S17, `FR` S03/S04/S09/S30, `HK` S05, `JP` S03/S05/S18, `CL` S02/S03/S05) |
| **`AWAITING_VERIFICATION`** | **6** | `2.00%` | Full section quarantined (`US` S17 & S18; `GB` S26; `FR` S17; `IE` S17; `CL` S17) |
| **`CONFLICTING`** | **0** | `0.00%` | Zero unresolved source conflicts |
| **`EXPIRED`** | **0** | `0.00%` | Superseded legacy claims isolated at claim level |
| **`NOT_APPLICABLE`** | **33** | `11.00%` | Legitimately inapplicable by legal instrument type (`US` 10 sections; `GB` 2; `NZ` 3; `SG` 2; `DE` 1; `FR` 2; `IE` 4; `HK` 1; `JP` 4; `CL` 4) |
| **Total Sections Evaluated** | **300** | **100.00%** | Exported in `phase_3_9_5_batch11_section_status.csv` |

---

## 6. 220 SPECIAL TOPIC STATUS SUMMARY (`10 × 22`)

Every Batch 11 pathway was evaluated across all **22 applicant special topics (`T01`–`T22`)**:

| Special Topic Verification Status | Count | Percentage | Notes |
| :--- | :---: | :---: | :--- |
| **`VERIFIED`** | **211** | `95.91%` | Directly supported by statutory or official agency guidance |
| **`PARTIALLY_VERIFIED`** | **6** | `2.73%` | `US` `T16` & `T20` (N-400 absence & fee schedule caveats); `NZ` `T16` (BN2 day-counting sub-clause caveat); `FR` `T08` (consular vs ANEF scope); `JP` `T20` (1 Oct 2026 fee transition); `CL` `T15` (pending certificate duration) |
| **`AWAITING_VERIFICATION`** | **0** | `0.00%` | Zero unverified special topics published without disclosure |
| **`CONFLICTING`** | **0** | `0.00%` | Zero conflicting special topics |
| **`EXPIRED`** | **0** | `0.00%` | Zero expired special topics |
| **`NOT_APPLICABLE`** | **3** | `1.36%` | `US` `T09` (Transit visa), `T10` (Border entry vs visa), `T19` (Visa overstay) legitimately inapplicable to LPR naturalization |
| **Total Special Topics Evaluated** | **220** | **100.00%** | Exported in `phase_3_9_5_batch11_special_topics_status.csv` |

---

## 7. CLAIM & EVIDENCE COUNTS (`900` CLAIMS) AND SCOPE DISTRIBUTION

### Claim Verification & Publication Breakdown
| Claim Verification Status | Count | Publication Eligibility | Quarantined? |
| :--- | :---: | :---: | :---: |
| **`VERIFIED`** | **728** | `PUBLISHED` | `false` |
| **`PARTIALLY_VERIFIED`** | **34** | `PUBLISHED` (with explicit scope caveat) | `false` |
| **`NOT_APPLICABLE`** | **99** | `PUBLISHED` (legitimate non-applicability notice) | `false` |
| **`AWAITING_VERIFICATION`** | **36** | `QUARANTINED` | `true` |
| **`CONFLICTING`** | **0** | `QUARANTINED` | `true` |
| **`EXPIRED`** | **3** | `QUARANTINED` | `true` |
| **Total Audited Claims** | **900** | **861 Published / 39 Quarantined** | **39 Quarantined** |

### Claim Applicability Scope Distribution
| Applicability Scope | Count | Percentage | Representative Examples |
| :--- | :---: | :---: | :--- |
| **`GLOBAL`** | **554** | `61.56%` | Statutory framework, core eligibility, document checklists, appeal rights |
| **`RESIDENCE_SPECIFIC`** | **322** | `35.78%` | Onshore status transitions (`US N-400`, `IE Stamp 1G`, `JP PR`, `CL Definitiva`), renewal rules |
| **`CONSULAR_JURISDICTION_SPECIFIC`** | **11** | `1.22%` | Local USCIS district / prefecture / `Ausländerbehörde` / ISA bureau processing & consular biometrics |
| **`NATIONALITY_SPECIFIC`** | **6** | `0.67%` | `FR` 1968 Franco-Algerian Agreement (`S04-2`, `S30-2`), `HK GEP` Afghanistan/Cuba/DPRK exclusion (`S04-1`, `S04-3`), `SG DP` conditional MJV `SGD 30` (`S18-3`), `NZ` nationality levy band (`S18-3`) |
| **`NATIONALITY_GROUP`** | **3** | `0.33%` | `FR` bilateral migration-flow accords (`S04-3`, `S09-3`, `S30-3`) |
| **`UNKNOWN`** | **4** | `0.44%` | Unverified bilateral treaty sub-schedules (`SG`, `HK`, `NZ`, `CL` `S30-3`) |
| **Total** | **900** | **100.00%** | Exported in `phase_3_9_5_batch11_claim_evidence_registry.csv` |

---

## 8. QUARANTINE ENFORCEMENT & PUBLIC/API SANITIZATION VERIFICATION

1. **Mandatory Quarantine Table Enforcement (`39` Quarantined Claims):**
   - All **4 `APPROVAL_READY_WITH_DISCLOSED_GAPS` pathways** (`p2-cand-us-n400`, `p2-cand-fr-vpf`, `p2-cand-jp-pr`, `p2-cand-cl-definitiva`) have pathway-level `verificationStatus = 'PARTIALLY_VERIFIED'` and quarantine every disclosed gap from Phase 3.9.4 (`6` claims on `US N-400`, `9` claims on `FR VPF`, `5` claims on `JP PR`, `6` claims on `CL Definitiva`), alongside `13` candidate-specific subpage/SLA claims on the remaining 6 pathways (`4` on `GB`, `3` on `NZ` including BN2 day-counting mechanics, `1` on `SG`, `1` on `DE`, `3` on `IE`, `1` on `HK`).
   - All `39` quarantined claims are cataloged in `phase_3_9_5_batch11_quarantine_register.csv` with `is_quarantined = true` and `publication_eligibility = QUARANTINED`.
2. **Public / API Sanitization Verification:**
   - Verified via automated TypeScript validation that `getPublicPriority2PathwayView(id)` strips `correctiveClassificationNotes` from every public pathway projection and that `sanitizeVisaDetailsForPublic()` removes `reviewerNotes`, `internalReviewNotes`, `correctiveClassificationNotes`, `reviewer`, and `editorId` and filters out all `isQuarantined === true` and `AWAITING_VERIFICATION` / `EXPIRED` claims before public rendering.

---

## 9. UPDATED PRIORITY 2 PROGRESS & BACKLOG STATUS

- **Completed Priority 2 Pathways:** **130 / 210** (`61.90%`)
  - Preserved Historical Batches 0–10: **120 pathways** (`3,600` section entries) — untouched.
  - Newly Implemented Batch 11: **10 pathways** (`300` section entries + `220` special topics).
- **Remaining Original Target Slots:** **80 slots** (`210 - 130 = 80`)
  - **33 verified genuine candidates** remain staged in `phase_3_9_3_curated_backlog_candidates.json` for future batches.
  - **47 additional genuine pathways** require future primary-source curation.
  - **Zero synthetic placeholders** (`p2-queue-backlog-121..210`) exist in `PRIORITY2_COMPLETED_PATHWAYS` or `PRIORITY2_FULL_QUEUE`.

---

## 17. MANDATORY FINAL STATUS SUMMARY

`PHASE 3.9.5 STATUS: COMPLETE`  
`PRE-IMPLEMENTATION BACKUP CREATED: YES`  
`BACKUP ARCHIVE PATH: /app/applet/backup_phase_3_9_5_batch11.tar.gz`  
`BACKUP ARCHIVE SIZE (BYTES): 113055`  
`BACKUP SHA-256 CHECKSUM: 62d7aef0c86aaa918914847d09b647af6d994f4286fbc24330193e352dc776f4`  
`BATCH 11 PATHWAYS IMPLEMENTED: 10`  
`PRIORITY 2 COMPLETED TOTAL: 130 / 210`  
`REMAINING ORIGINAL SLOTS: 80`  
`PROFILE SECTIONS EVALUATED: 300`  
`SPECIAL TOPICS EVALUATED: 220`  
`VERIFIED CLAIMS: 728`  
`PARTIALLY_VERIFIED CLAIMS: 34`  
`AWAITING_VERIFICATION CLAIMS: 36`  
`CONFLICTING CLAIMS: 0`  
`EXPIRED CLAIMS: 3`  
`NOT_APPLICABLE CLAIMS: 99`  
`QUARANTINED CLAIMS: 39`  
`PUBLIC SANITIZATION VERIFIED: YES`  
`HISTORICAL BATCHES 0-10 UNTOUCHED: YES`  
`CRON UNCHANGED (30 21 * * * UTC): YES`  
`PRODUCTION DEPLOYMENT EXECUTED: NO`  
`PRODUCTION DATABASE MIGRATION EXECUTED: NO`  
`BATCH 12 STARTED: NO`  
`ADDITIONAL BUDGET SPENT: ₹0`  
`READY FOR BATCH 11 VERIFICATION OR NEXT CANDIDATE CURATION PHASE: YES`
