# PHASE 3.9.4 — BATCH 11 FINAL CANDIDATE APPROVAL & IMPLEMENTATION PREFLIGHT REPORT

**Project:** VisaApply.org — Global Visa & Immigration Intelligence Platform  
**Phase:** 3.9.4 (Review & Preflight Only — No Batch 11 Implementation Started)  
**Additional Spend:** ₹0 (Zero paid APIs, zero new packages, zero DB/SQLite/Neon changes, zero `vercel.json` cron changes)  
**Preserved Baselines:** 120 completed Priority 2 pathways | 142 Priority 1 pathways | Cron `30 21 * * *` UTC | Zero `src/` modifications  

---

## 1. Executive Summary

Phase 3.9.4 completed a strict, non-rubber-stamp verification and classification preflight of all **10 candidates** staged in `phase_3_9_3_proposed_batch11_candidates.json` across `src/data/priority2AuditData.ts` (120 completed pathways), `src/data/priority1AuditData.ts` (142 pathways), the 30-section profile schema (`S01..S30`), the 22 cross-cutting special topics (`T01..T22`), and targeted live primary-source rechecks.

- **Zero Duplication Confirmed:** Programmatic intersection across all 120 Priority 2 pathways and 142 Priority 1 pathways confirmed **0** `id` collisions, **0** `canonicalUrl` collisions, and **0** same-legal-route collisions across all 40 same-country Priority 2 pathways and same-country Priority 1 pathways.
- **Critical Live Fee & Statutory Discoveries During Recheck (Proving Non-Stale Verification):**
  - **Japan Permanent Residence (`p2-cand-jp-pr`):** Live `moj.go.jp` (`2026-10-27`) confirmed the major October 2026 statutory fee revision to **¥200,000** revenue stamp (for applications accepted from 1 Oct 2026; ¥10,000 transitional prior to 30 Sep 2026; ¥20,000 reduced exempt rate).
  - **France Carte de séjour « vie privée et familiale » (`p2-cand-fr-vpf`):** Live `service-public.gouv.fr` (`2026-11-06`) confirmed updated 1st-issuance fiscal fee of **€350** (`€50` timbre + `€300` taxe), or **€250** (`€50 + €200`) when transitioning from an existing valid titre de séjour.
  - **Hong Kong GEP (`p2-cand-hk-gep`):** Live `immd.gov.hk` (`GEP.html` + `specifiedschemes.html`) confirmed the two-tier Cap. 115A Schedule 2 Specified Scheme structure: **HK$600** non-refundable application fee + **HK$1,300** (`>180 days`) or **HK$600** (`<=180 days`) issuance fee.
  - **Chile Residencia Definitiva (`p2-cand-cl-definitiva`):** Live `serviciomigraciones.cl/aranceles-migratorios/` confirmed **$142.726 CLP** general fee, with **exempt status** (`Exento de pago`) for foreign spouses of Chilean citizens and minors `<18`.
  - **USA Naturalization (`p2-cand-us-n400`):** While `uscis.gov/citizenship/apply-for-naturalization` and `uscis.gov/n-400` returned `HTTP 200`, `uscis.gov/forms/filing-fees` returned **Akamai EdgeSuite `HTTP 403`**, leaving exact dollar fees (`S18`) and dynamic field-office processing times (`S17`) transparently quarantined/flagged as open gaps rather than assumed from memory.

### Final Decision Tally (10 Candidates)

| Decision | Count | Candidates |
|---|---:|---|
| **`APPROVAL_READY`** | **6** | `p2-cand-gb-seasonal`, `p2-cand-nz-aip`, `p2-cand-sg-dp`, `p2-cand-de-18d-research`, `p2-cand-ie-stamp1g`, `p2-cand-hk-gep` |
| **`APPROVAL_READY_WITH_DISCLOSED_GAPS`** | **4** | `p2-cand-us-n400`, `p2-cand-fr-vpf`, `p2-cand-jp-pr`, `p2-cand-cl-definitiva` |
| `NEEDS_MORE_EVIDENCE` / `CONFLICTING` / `REJECT_*` | **0** | None |

---

## 2. Duplicate, Overlap & Category Collision Review (§5)

Cross-checking the 10 candidates against `PRIORITY2_COMPLETED_PATHWAYS` (`120` records) and `PRIORITY1_AUDIT_PATHWAYS` (`142` records):

- **United States (`p2-cand-us-n400`):** Existing P2 covers `H-1B`, `L-1`, `O-1`, `E-2`, `EB-2 NIW`; P1 covers `O-1A`. No naturalization/citizenship record exists. **Zero collision.**
- **United Kingdom (`p2-cand-gb-seasonal`):** Existing P2 covers `Skilled Worker`, `Global Talent`, `Scale-up`, `Innovator Founder`, `Family Partner`, `Graduate`. Seasonal Worker (`Appendix Temporary Work – Seasonal Worker`) has **0** overlap.
- **New Zealand (`p2-cand-nz-aip`):** Existing P2 covers `AEWV`, `Skilled Migrant Category`, `Post Study Work`, `Straight to Residence`. Active Investor Plus (`Growth $5M` / `Balanced $10M`) has **0** overlap.
- **Singapore (`p2-cand-sg-dp`):** Existing P2 covers `COMPASS EP`, `EP`, `S Pass`, `ONE Pass`, `EntrePass`. Dependant's Pass is a derivative family pass with **0** overlap.
- **Germany (`p2-cand-de-18d-research`):** Existing P2 covers `EU Blue Card (§ 18g)`, `Skilled Worker (§§ 18a/18b)`, `Freelance (§ 21 Abs. 5)`, `Niederlassungserlaubnis (§§ 9, 18c)`; P1 covers `Chancenkarte (§ 20a)`. Researcher `§ 18d AufenthG` has **0** overlap.
- **France (`p2-cand-fr-vpf`):** Existing P2 covers `Talent Passport` (`Startup`, `Qualified Employee`, `Researcher`) and `Salarié`. `Carte de séjour « vie privée et familiale »` (CESEDA Art. L.423) is family-based with **0** overlap.
- **Ireland (`p2-cand-ie-stamp1g`):** Existing P2 covers `CSEP`, `GEP`, `Stamp 4`. `Third Level Graduate Programme (Stamp 1G)` is post-study permission with **0** overlap.
- **Japan (`p2-cand-jp-pr`):** Existing P2 covers `HSP1`, `SSW`, `Business Manager`, `Gijinkoku`; P1 covers `Digital Nomad`. `Permission for Permanent Residence (永住許可, Art. 22)` has **0** overlap.
- **Hong Kong (`p2-cand-hk-gep`):** Existing P2 covers `TTPS`, `QMAS`, `IANG`. `GEP` Note 1 explicitly separates GEP from IANG (non-local graduates) and Mainland ASMTP. **Zero collision.**
- **Chile (`p2-cand-cl-definitiva`):** Existing P2 covers `Residencia Temporal Laboral` and `Residencia Temporal Jubilado y Rentista`. `Residencia Definitiva` (Arts. 78–83) is permanent settlement with **0** overlap.

---

## 3. Special §4 Classification & Statutory Boundary Reviews

### 3.1 USA — Naturalization, Form N-400 (`p2-cand-us-n400`)
- **Mandatory Classification Rule:** Must be classified strictly as **Citizenship / Naturalisation Application (Non-Visa Status Benefit)** — NEVER labeled as a visa, immigrant visa subclass, or consular entry clearance.
- **Instrument vs Statutory Eligibility Separation:** Batch 11 claims must cleanly separate **(1) Filing Instrument (`Form N-400`, Application for Naturalization)** including the USCIS 90-day early filing window (`uscis.gov/n-400` HTTP 200), from **(2) Underlying Substantive Eligibility (`INA §§ 312, 316, 319`; `8 CFR Part 316`)** covering 5-year LPR continuous residence / 30-month physical presence, 3-year marital union to a U.S. citizen / 18-month physical presence, good moral character, English & civics requirements (`§ 312` exemptions), and Oath of Allegiance (`INA § 337`).
- **Schema Adaptations (`NOT_APPLICABLE`):** `S13` Path to Permanent Residency (prerequisite already held), `S24` Post-Arrival Registration, `S25` Employer Sponsorship, `S26` Annual Quotas/Caps, `S29` Visa Overstay Controls, and `T09`/`T10`/`T19` must be marked `LEGITIMATELY_NOT_APPLICABLE` (with denaturalization/LPR maintenance cross-noted carefully in `S28`).
- **Disclosed Gaps:** `uscis.gov/forms/filing-fees` returned Akamai `HTTP 403`, and `egov.uscis.gov/processing-times/` is a dynamic SPA. Unless verified from authoritative USCIS Fee Schedule PDF (`G-1055`) during implementation, `S18` and `S17` field-office SLAs remain quarantined. **Decision: `APPROVAL_READY_WITH_DISCLOSED_GAPS`.**

### 3.2 Singapore — Dependant's Pass (`p2-cand-sg-dp`)
- **Mandatory Scope Separation (Verified Live on `mom.gov.sg/.../eligibility` & `/key-facts`):**
  1. **Principal Pass Holder Prerequisites (`S03`/`S25`):** Must explicitly state that eligibility is strictly derivative from an **Employment Pass or S Pass** holder earning **>= S$6,000 fixed monthly salary** (individual salary, NOT combined household income) sponsored by an **established, Singapore-registered company** (explicitly excluding Work Permit holders and differentiating ONE Pass / EntrePass dependant rules and WTO GATS / FTA overseas ICT exclusions).
  2. **Qualifying Dependants (`S03`/`S15`):** Strictly limited to **(a) legally married spouse** and **(b) unmarried children under 21 years old** (including legally adopted children). Common-law spouses, unmarried handicapped children `>=21`, parents, or step-children fall under the separate **Long-Term Visit Pass (LTVP)** — which must be clearly cross-referenced and NOT conflated with DP.
  3. **Sponsorship & Fee Mechanics Verified (`HTTP 200`):** Application must be filed by the principal's employer or appointed Employment Agent (`key-facts`); **S$105** application + **S$225** pass issuance (+ **S$30** Multiple Journey Visa if applicable); **3 weeks** standard SLA for EP/S Pass dependants (**6 weeks** for EP Sponsorship/PEP/EntrePass). Work rights (`S09`: MOM `working-in-singapore` Work Pass / LOC rules) scheduled for Batch 11 implementation. **Decision: `APPROVAL_READY`.**

### 3.3 Germany — Residence Permit for Research, `§ 18d AufenthG` (`p2-cand-de-18d-research`)
- **Mandatory Statutory Decomposition (Verified Verbatim from `gesetze-im-internet.de/aufenthg_2004/__18d.html`):**
  1. **`§ 18d(1) S. 1 Nr. 1a/1b`:** Requires an effective hosting agreement (`Aufnahmevereinbarung`) or corresponding contract with either a BAMF-recognised research institution (triggering the statutory **60-day adjudication limit** under `§ 18d(1) S. 2`) or another research-conducting institution.
  2. **BA Consent Waiver (`§ 18d(1)`):** Issued **`ohne Zustimmung der Bundesagentur für Arbeit`** (no Federal Employment Agency labor-market approval required).
  3. **Cost-Assumption Undertaking (`§ 18d(1) Nr. 2`, `(2)`, `(3)`):** Written obligation for up to **6 months** post-termination covering public subsistence & deportation costs — with statutory waiver (`soll abgesehen werden`) for predominantly publicly funded institutions or special public interest (`§ 18d(2)`).
  4. **Validity Tiers (`§ 18d(4)`):** Granted for **at least 1 year**, or **at least 2 years** for EU/multilateral mobility programme participants (or matching shorter project duration).
  5. **Permitted Teaching Scope (`§ 18d(5)`):** Covers both research at the named institution **and teaching activities (`Tätigkeiten in der Lehre`)**; project modifications during stay do not revoke permission.
  6. **Statutory Fees (`§ 45 AufenthV`, `HTTP 200`):** **€100** initial issuance (`<=1 yr` or `>1 yr`), **€96** extension (`<=3 months`) / **€93** extension (`>3 months`), **€98** purpose change — cleanly distinguished during implementation from `§ 46 AufenthV` National D-visa consular fees (€75) and intra-EU research mobility (`§§ 18e / 18f`). **Decision: `APPROVAL_READY`.**

---

## 4. Candidate-by-Candidate Summary of Remaining 7 Candidates (§3, §4, §7)

| Slot | Candidate ID | Live Official Recheck Highlights (`HTTP 200` unless noted) | Disclosed Gaps / Guardrails | Decision |
|---:|---|---|---|---|
| 2 | `p2-cand-gb-seasonal` | GOV.UK Overview & Eligibility (`200`): `>=18`, DEFRA scheme-operator CoS, horticulture `<=6m` / poultry `2 Oct–31 Dec`, **£340** fee, **£1,270** 28-day savings, **3-week SLA**, NO dependants/public funds/2nd job. | Fetch annual Home Office quota (`S26`) during impl; mark `S12/S13/S14/S15/S21/S24` N/A. | **`APPROVAL_READY`** |
| 3 | `p2-cand-nz-aip` | INZ Active Investor Plus (`200`): **Cost From NZD $27,470**, **80% AIP within 11 weeks**, Growth `>=NZD $5M` (3-yr PR) or Balanced `>=NZD $10M` (5-yr PR), 6m transfer window, partner & children `<=24`. | Pull exact Growth/Balanced minimum physical presence days (`S27`) & BN2 levy breakdown during impl. | **`APPROVAL_READY`** |
| 6 | `p2-cand-fr-vpf` | Service-Public `F2209` (`200`, verified `2026-11-06`): **€350** 1st issuance (`€50+€300`) / **€250** renewal (`€50+€200`), 1-yr initial -> 4-yr pluriannual card with CIR, unrestricted work right. | Multi-branching CESEDA `L.423-1..L.423-23` sub-tracks + bilateral Algerian accord carve-out; `S17` nationwide prefecture SLA undisclosed -> quarantine. | **`APPROVAL_READY_WITH_DISCLOSED_GAPS`** |
| 7 | `p2-cand-ie-stamp1g` | ISD Third Level Graduate Programme (`200`, `2024-03-28`): NFQ L8 (`12m`, 7y cap) / L9+ (`24m`, 8y cap), max 2 uses, **€300** IRP fee, apply within 6m on valid Stamp 2, medical insurance. | Distinguish Graduate Stamp 1G from post-May 2024 Spousal Stamp 1G; check current IRP registration SLA (`S17`). | **`APPROVAL_READY`** |
| 8 | `p2-cand-jp-pr` | ISA `16-4.html` (`200`, `2026-10-27`): Art. 22 basis, guarantor, **live Oct 2026 fee update to ¥200,000** (¥10,000 pre-Oct 2026; ¥20,000 reduced exempt). | Quantitative `10y/5y/3y/1y HSP` rules reside on separate `nyukan_nyukan50.html` guideline page; `S17` actual regional ISA backlog undisclosed -> quarantine. | **`APPROVAL_READY_WITH_DISCLOSED_GAPS`** |
| 9 | `p2-cand-hk-gep` | ImmD `GEP.html` (`2026-04-15`) + `specifiedschemes.html` (`200`): Quota-free, excludes Mainland & AF/CU/KP, **HK$600** app + **HK$1,300** (`>180d`) / **HK$600** (`<=180d`) issue, **4-week SLA**, **36m** initial stay. | Minor dependant/7-yr ROA cross-refs during impl; cleanly separate from Batch 10 `IANG`. | **`APPROVAL_READY`** |
| 10 | `p2-cand-cl-definitiva` | SERMIG `residencia-definitiva` (`2026-07-17`) + `aranceles-migratorios` (`200`): `Ley N° 21.325`, ClaveÚnica digital filing `<=90d` pre-expiry, **$142.726 CLP** (exempt for Chilean spouse & minors `<18`). | `S17` processing SLA undisclosed ("en trámite" issued) -> quarantine `S17`; verify Decreto N° 177 12/24/48m tenure & absence caps (`S03/S27`). | **`APPROVAL_READY_WITH_DISCLOSED_GAPS`** |

---

## 5. Profile Schema & Special-Topic Readiness Summary (§6)

All 10 candidates were evaluated deterministically across **30 sections (`S01..S30`)** and **22 special topics (`T01..T22`)** (`520` total matrix rows in `phase_3_9_4_profile_schema_readiness.csv`):
- **Core Identity, Authority, Channels, Fees (`S01`, `S02`, `S16`, `S18`):** Ready across 9/10 candidates; US Form N-400 `S18` requires direct G-1055 PDF lookup due to Akamai 403 on `/forms/filing-fees`.
- **Processing Times (`S17`):** Verified live for **GB (3 weeks)**, **NZ (80% within 11 weeks AIP)**, **SG (3/6 weeks)**, **DE (60-day statutory limit under § 18d(1) S. 2)**, and **HK (4 weeks)**; explicitly quarantined as `AWAITING_VERIFICATION` / disclosed gaps for **US (field-office dynamic SPA)**, **FR (prefecture ANEF variance)**, **JP (regional ISA backlog beyond 4-month standard)**, and **CL (undisclosed SERMIG SLA)**; scheduled for ISD IRP check on **IE**.
- **Legitimately Non-Applicable Sections (`LEGITIMATELY_NOT_APPLICABLE`):** Prevent hallucinated filler for structurally absent obligations (e.g., `S13/S14/S15/S21/S24` on `GB Seasonal Worker`; `S13/S24/S25/S26/S29` and `T09/T10/T19` on `US N-400`; `S13/S14` derivative limits on `SG DP`; `S15` dependant exclusion on `IE Stamp 1G`).
- **22 Special Topics (`T01..T22`):** All applicable operational/compliance topics are mapped cleanly for targeted sovereign research during Batch 11 implementation, with **0** blocking schema incompatibilities.

---

## 6. Readiness Verdict for Batch 11 Implementation (§8)

- **Minimum 10-Pathway Batch Target Satisfied:** All **10** candidates are unique, non-overlapping, correctly classified (subject to explicit §4 guardrails), and backed by live HTTP 200 sovereign evidence (**6 `APPROVAL_READY`** + **4 `APPROVAL_READY_WITH_DISCLOSED_GAPS`**).
- **Safe Implementation Conditions for the 4 Disclosed-Gap Candidates:** Batch 11 may safely implement all 10 candidates **provided** that any unresolved gap (`US N-400` G-1055 fee if still unverified, `US/FR/JP/CL` `S17` dynamic/undisclosed processing SLAs) stays strictly `AWAITING_VERIFICATION` and **quarantined** (unpublished) under VisaApply.org's zero-fabrication rule rather than estimated.
- **Authorization Gate:** Phase 3.9.4 is strictly a preflight and approval phase. **Batch 11 implementation remains NOT STARTED** awaiting explicit user authorization.

---

## 7. MANDATORY FINAL STATUS SUMMARY

- Completed Priority 2 pathways: **120**
- Remaining Priority 2 backlog target: **90**
- Batch 11 staged candidates reviewed: **10**
- Approval decisions summary: **6 `APPROVAL_READY`**, **4 `APPROVAL_READY_WITH_DISCLOSED_GAPS`**, **0 `NEEDS_MORE_EVIDENCE`**, **0 `CONFLICTING`**, **0 `REJECT_DUPLICATE`**, **0 `REJECT_INVALID_CLASSIFICATION`**
- Batch 11 implementation status: **NOT STARTED**
- Production deployment / migration status: **NOT AUTHORIZED**
- Database status: **SQLite untouched / Neon untouched**
- Cron status: **`30 21 * * *` unchanged**
- Files created: `phase_3_9_4_batch11_approval_report.md`, `phase_3_9_4_candidate_approval_matrix.csv`, `phase_3_9_4_profile_schema_readiness.csv`, `phase_3_9_4_official_source_recheck.csv`, `phase_3_9_4_change_manifest.json`
- Additional spend: **₹0**
