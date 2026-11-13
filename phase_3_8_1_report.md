# PHASE 3.8.1 — TARGETED INTEGRITY CLEANUP REPORT (POST BATCH 9)
**VisaApply.org — Global Immigration Intelligence Platform**  
**Scope:** Workstream A (`p2-au-189`) & Workstream B (`p2-nz-poststudy`) ONLY  
**Verification Date:** `2026-11-13T09:57:00Z` | **Additional Spend:** `₹0` | **Batch 10 Started:** `NO`

---

## Section A — Executive Summary

1. **Strict Scope Discipline:** Phase 3.8.1 inspected and updated **only** `p2-au-189` (Australia Subclass 189 — Points-Tested Stream) and `p2-nz-poststudy` (New Zealand Post Study Work Visa). Zero new pathways were added, Batch 10 was not started, historical Batches 0–8 were untouched, production SQLite / Neon test DBs were untouched, and `vercel.json` cron (`30 21 * * * UTC`) remained intact.
2. **Australia Subclass 189 (`p2-au-189`) Fee Conflict Resolved via Primary Legislation:** Direct retrieval of Commonwealth legislative instruments on the Federal Register of Legislation (`legislation.gov.au`, HTTP `200`) resolved the Phase 3.8 SPA pricing-page conflict (`AUD 6,135`) using authoritative statutory text in force as of `2026-11-01` (**Migration Regulations 1994 Compilation No. 290 `F1996B03551`**) as amended by **Home Affairs Legislation Amendment (2026 Measures No. 1) Regulations 2026 (`F2026L00874` Sch. 3 Item 20, commenced 1 July 2026)**. All three Section 18 VAC claims (`CLM-AU-B9-S18-1..3`) were promoted from `CONFLICTING` (quarantined) to `VERIFIED` (published), while all three Section 17 live Home Affairs processing-time claims (`CLM-AU-B9-S17-1..3`) remain `AWAITING_VERIFICATION` and strictly quarantined (`isQuarantined: true`, `isPublished: false`).
3. **New Zealand Post Study Work Visa (`p2-nz-poststudy`) Separation & Anti-Stale Labeling Completed:** Live `HTTP 200` checks across `post-study-work-visa/`, `work-visa-wait-times/`, and `impact-of-microsoft-outage/` cleanly separated statutory visa terms (`NZD $5,000` funds, up to 3 years, `From NZD $1,670` base fee floor), upcoming `16 Nov 2026` (online-only) / `23 Nov 2026` (NZQCF L7 grad diploma + bachelor extension) transitions, weekly rolling 4-week wait-time statistics (`50% = 2 weeks; 80% within 3.5 weeks` in working days, checked `2026-11-13T09:54:55Z`, `PARTIALLY_VERIFIED` historical metric, not a SLA), and the `13 Nov 2026 09:50 NZDT` Microsoft outage advisory (labeled strictly with observation timestamp and live re-verification caveat). Country/location-dependent fee variance (`CLM-NZ-B9-S18-3`) was conservatively reclassified from `VERIFIED` to `PARTIALLY_VERIFIED`.
4. **Reconciled Platform Baselines:** Priority 2 remains **`110 / 210` completed** (`100` remaining, **`3,300` cumulative sections**, `10` Batch 9 pathways, `900` Batch 9 claims). Following the two documented claim-level resolutions above, Batch 9 published claims changed from **`844` to `847`** (`730 VERIFIED`, `73 PARTIALLY_VERIFIED`, `44 NOT_APPLICABLE`) and quarantined claims decreased from **`56` to `53`** (`49 AWAITING_VERIFICATION`, **`0 CONFLICTING`**, `4 EXPIRED`).

---

## Section B — Pre-Change Recovery Backup Verification

- **Archive Path:** `/app/applet/backup_phase_3_8_1.tar.gz`
- **Size:** `147,907` bytes (~144.4 KB)
- **SHA-256:** `9379e7d7db858a8908a1d45e4bc13a88c3affe4c8a93420a003bb56d5e4e8aab`
- **Status:** Created prior to any Phase 3.8.1 file modifications covering `src/data/priority2AuditData.ts`, `src/pages/GlobalVisaCoverageAuditPage.tsx`, `scripts/executePhase38Batch9Audit.ts`, and all 6 Batch 9 JSON/CSV deliverables.

---

## Section C — Australia Subclass 189 Fee Review Findings (`p2-au-189`)

| Statutory / Evidence Dimension | Findings & Verbatim Statutory Values | Verification Outcome |
|---|---|---|
| **Primary In-Force Legislation** | *Home Affairs Legislation Amendment (2026 Measures No. 1) Regulations 2026* (**F2026L00874**, Sch. 3 Item 20, commenced **1 July 2026**) incorporated into *Migration Regulations 1994* **Compilation No. 290 (F1996B03551, in force 1 Nov 2026)**. Vol. 4 Item 1137 legislative history confirms `F2026L00874` is the latest amendment to Item `1137`. | `VERIFIED` (`HTTP 200` on `legislation.gov.au`) |
| **Points-Tested 1st Instalment (Standard — Subitem `1137(3)(b)`)** | Primary Base Application Charge: **`AUD 6,135`** · Additional Applicant (18+): **`AUD 3,070`** · Additional Applicant (<18): **`AUD 1,540`** | `VERIFIED` (`GLOBAL`, `CLM-AU-B9-S18-1`) |
| **Points-Tested 1st Instalment (Pacific Concession — Subitem `1137(3)(a)`)** | Valid Pacific regional country passport holders & combined applicants: Base **`AUD 5,030`** · Additional 18+ **`AUD 2,515`** · Additional <18 **`AUD 1,260`** | `VERIFIED` (`NATIONALITY_GROUP`, `CLM-AU-B9-S18-2`) |
| **2nd Instalment & Reg. `2.12C` Surcharges** | `Subitem 1137(4)`: **`AUD 4,885`** payable pre-grant if aged 18+ without functional English (else `Nil`). `Reg. 2.12C(5)-(9)`: **`AUD 700`** Subsequent Temporary Application Charge (STAC) & **`AUD 80`** non-Internet charge where applicable. | `VERIFIED` (`RESIDENCE_SPECIFIC`, `CLM-AU-B9-S18-3`) |
| **Third-Party Cost Boundary** | Excludes external skills assessments (ACS, EA, VETASSESS, AHPRA), IELTS/PTE/TOEFL tests, medical exams, police clearances, and migration agent fees. | Explicitly separated |
| **Live DHA Portal (`immi.homeaffairs.gov.au`)** | SSR shell `HTTP 200` (`len=1752`); Pricing Estimator API (`/_layouts/15/api/data.aspx/GetPriceList`) returned `HTTP 500`. Live Section 17 processing time claims (`CLM-AU-B9-S17-1..3`) **remain `AWAITING_VERIFICATION` & quarantined**. | `S17` Quarantined (`true`) |

---

## Section D — New Zealand Post Study Work Visa Review Findings (`p2-nz-poststudy`)

1. **Static Visa Eligibility, Funds & Base Cost (`post-study-work-visa/`, `HTTP 200`, checked `2026-11-13T09:54:55Z`):**
   - Stay length: `Up to 3 years` · Apply within `3, 6 or 12 months` after student visa expiry · Minimum funds: **`NZD $5,000`** (`VERIFIED`, `S05`) · Fee floor: **`From NZD $1,670`** (`VERIFIED`, `S18-1`).
   - Exact payable fee variation (`"Costs and processing times depend on your country and where you apply from"`) reclassified conservatively to **`PARTIALLY_VERIFIED`** (`NATIONALITY_SPECIFIC`, `CLM-NZ-B9-S18-3`).
   - Upcoming transitions separated clearly: paper applications end **`16 November 2026`** (online-only thereafter); PSWV eligibility extension for full-time NZ NZQCF Level 7 graduate diploma + bachelor's degree holders postponed by 1 week from `16 Nov` to **`23 November 2026`**.
2. **Retrospective Rolling Processing Statistic (`work-visa-wait-times/`, `HTTP 200`, checked `2026-11-13T09:54:55Z`):**
   - Verbatim Table 1 (*"Wait times for work visa applications processed in the last 4 weeks. This page is updated weekly."*): **`Post-Study Work Visa` -> Average wait time (50%): `2 weeks` | Most completed within (80%): `3.5 weeks`**, measured in working days (excluding weekends & NZ public holidays).
   - Explicitly typed as **`DYNAMIC_ROLLING_WAIT_TIME_STATISTIC`** (`PARTIALLY_VERIFIED`, `CLM-NZ-B9-S17-1`), NOT a fixed SLA. *(Also corrected the exact live INZ URL path discovered during GET verification: `/process-to-apply/waiting-for-a-visa/processing-a-visa-application/how-long-it-takes-to-process-an-application/work-visa-wait-times/`.)*
3. **Transient Operational Incident Advisory (`impact-of-microsoft-outage/`, `HTTP 200`, Issued `13 Nov 2026 09:50 am NZDT`, Observed `2026-11-13T09:54:55Z`):**
   - Documented verbatim INZ pause on visa processing and Immigration Online applications (NZeTA unaffected) and 1-week postponement of `16 Nov` system changes to `23 Nov 2026`.
   - Tagged `TRANSIENT_OPERATIONAL_INCIDENT_ADVISORY` with explicit UTC observation timestamp (`2026-11-13T09:54:55Z`) and mandatory live re-verification caveat so stale historical outages are never presented as permanently active.

---

## Section E — Modified Records, Metric Deltas & Reconciliation

| Metric | Phase 3.8 Before | Phase 3.8.1 After | Delta & Justification |
|---|---:|---:|---|
| **Priority 2 Completed / Queue** | `110 / 210` (`100` remaining) | `110 / 210` (`100` remaining) | `0` (Preserved exact baseline) |
| **Batch 9 Pathways / Sections / Claims** | `10` / `300` / `900` | `10` / `300` / `900` | `0` (Preserved exact baseline) |
| **Batch 9 Published Claims** | `844` | **`847`** | `+3` (`CLM-AU-B9-S18-1..3` resolved from `CONFLICTING` to `VERIFIED` via `F2026L00874` / `F1996B03551`) |
| **Batch 9 Quarantined Claims** | `56` (`49` Awaiting / `3` Conflicting / `4` Expired) | **`53`** (`49` Awaiting / **`0` Conflicting** / `4` Expired) | `-3` (`CONFLICTING` resolved cleanly; `CLM-AU-B9-S17-1..3` kept `AWAITING_VERIFICATION` & quarantined) |
| **Batch 9 Status Breakdown** | `728` Verified / `72` Partial / `44` N/A | **`730` Verified / `73` Partial / `44` N/A** | AU `S18` `+3 VERIFIED`; NZ `S18-3` `VERIFIED -> PARTIALLY_VERIFIED` (`-1/+1`) |
| **Batch 9 Section Statuses** | `233` Ver / `45` Part / `14` Await / `1` Conf / `7` N/A | **`233` Ver / `46` Part / `14` Await / `0` Conf / `7` N/A** | AU `S18` `CONFLICTING -> VERIFIED`; NZ `S18` `VERIFIED -> PARTIALLY_VERIFIED` |
| **AU `p2-au-189` Special Topic `t20`** | `CONFLICTING` (quarantined) | `PARTIALLY_VERIFIED` (published) | `1 July 2026` VAC commencement verified; live processing updates SPA-quarantined |

---

## Section F — Validation, Build & Runtime Checks

- **Targeted Integrity Assertions:** Verified `110 / 210` P2 pathways, `100` backlog items, `0` Batch 10 records, `0` duplicate claim/evidence IDs, `300` Batch 9 sections, `900` Batch 9 claims, strict quarantine filtering (`sanitizeComprehensiveProfile` & `VisaDetailRenderer`), timestamped dynamic wait times (`2026-11-13T09:54:55Z`) and outage observation (`2026-11-13T09:54:55Z`), and `vercel.json` cron (`30 21 * * *`).
- **Build & Static Checks:** Co-executed `compile_applet` and `lint_applet` (`0` errors) + live dev server HTTP `200` verification.

---

## Section G — Remaining Risks & Operational Caveats

1. **Department of Home Affairs SPA Processing Times (`p2-au-189` Section 17):** Because `immi.homeaffairs.gov.au` renders live monthly processing percentiles client-side and its JSON endpoint (`/GetPriceList`) returns `HTTP 500` without a browser SharePoint request digest, Section 17 (`CLM-AU-B9-S17-1..3`) remains intentionally quarantined until a statically verifiable DHA feed or Data.gov.au dataset becomes available.
2. **INZ Transient Incident Resolution (`p2-nz-poststudy`):** The global Microsoft outage advisory (`2026-11-13T09:50 NZDT`) and the weekly rolling wait-time percentiles (`2 weeks` / `3.5 weeks`) require automated re-polling via the scheduled daily cron (`30 21 * * * UTC`) to retire the incident banner once INZ confirms service restoration.
3. **STOP Gate Enforced:** Phase 3.8.1 is complete. Execution stops prior to Batch 10.
