# VISAAPPLY.ORG — PHASE 3.6.9.2
## BATCH 7 FINAL DATA INTEGRITY & CANONICAL NORMALIZATION REPORT
**Document Version:** 1.0.0  
**Effective Date:** 2026-11-12  
**Scope:** Final Data Integrity, Arithmetic Verification, Staffing Criteria Precision, Stream Separation, and Canonical Sovereign URL Normalization for the 5 Targeted Batch 7 Pathways  
**Budget & Infrastructure:** ₹0 Additional Spend | Zero Paid APIs | Production SQLite & Neon Untouched | Ingestion Cron `30 21 * * *` UTC (03:00 IST) Preserved

---

## 1. EXECUTIVE SUMMARY & DISPOSITION

In Phase 3.6.9.2, VisaApply.org executed a surgical data-integrity and source-normalization audit across the **five targeted Priority 2 Batch 7 immigration pathways**:
1. **South Korea — E-9 Non-Professional Employment (`p2-kr-e9`)**
2. **Japan — Business Manager (`p2-jp-businessmanager`)**
3. **Australia — Temporary Graduate Subclass 485 (`p2-au-grad485`)**
4. **Canada — Start-up Visa (`p2-ca-suv`)**
5. **Finland — Residence Permit for an Employed Person TTOL (`p2-fi-worker`)**

### Quota Conservation & Strict Scope Boundaries:
- **No full-project audit:** Historical Batches 0 through 6 were preserved untouched.
- **No Batch 8 expansion:** In accordance with user instructions, Batch 8 was **NOT** started or created.
- **Production databases protected:** Production SQLite and Neon test databases remained 100% untouched.
- **Automated ingestion schedule preserved:** Daily automated cron ping at `30 21 * * *` UTC (03:00 IST) in `vercel.json` remained unchanged.
- **Zero blank fields:** All numeric, statutory, and calculation basis fields are fully populated and reconciled across code, database schemas, and export files.

---

## 2. PRE-CHANGE RECOVERY BACKUP METADATA

Before any file modifications were enacted, a restorable archive of the affected scripts, data files, and export definitions was generated and cryptographically verified:

| Attribute | Verified Value |
| :--- | :--- |
| **Archive File Name** | `backup_phase_3_6_9_2.tar.gz` |
| **Storage Path** | `/app/applet/backup_phase_3_6_9_2.tar.gz` |
| **File Size** | `110,344` bytes (~108 KB) |
| **SHA-256 Checksum** | `85287affe54434c33a5a8b2d3c8dd7bc80759fd8d0ef3b63c170a2b3fbc8a9d1` |
| **Archive Integrity** | Verified readable via `tar -tzf backup_phase_3_6_9_2.tar.gz` (zero corrupt blocks) |
| **Timestamp** | 2026-11-12T10:13:10Z |

*(Historical backups, including `backup_phase_3_6_9_1.tar.gz` [13.95 MB, SHA-256: `df2deb7d...`], remain safely archived).*

---

## 3. TARGETED LEGAL & DATA INTEGRITY CORRECTIONS

### A. South Korea — E-9 Non-Professional Employment (`p2-kr-e9`)

#### Complete Calculation Basis & Arithmetic Proof:
- **2026 Statutory National Minimum Wage:** Gazetted at **KRW 10,320 per hour** (+2.89% increase over 2025 KRW 10,030/hr) pursuant to Ministry of Employment and Labor (MOEL) Public Notice No. 2025-56.
- **Statutory Monthly Paid Hours Basis (209 Hours):**
  Under Korean Labor Standards Act Article 55 and Enforcement Decree Article 30, standard paid monthly hours are calculated as:
  $$\text{Standard Monthly Hours} = \left(\frac{40\text{ regular hours/week} + 8\text{ paid weekly holiday allowance hours}}{7\text{ days/week}}\right) \times \left(\frac{365\text{ days/year}}{12\text{ months/year}}\right) = 208.5714 \rightarrow \mathbf{209\text{ paid hours}}$$
- **Monthly Result:**
  $$209\text{ hours} \times \text{KRW } 10,320/\text{hour} = \mathbf{KRW\ 2,156,880\text{ / month}}$$
- **Statutory Benchmark Clarification:**
  This KRW 2,156,880/month figure is a **mandatory national statutory minimum-wage floor**, NOT a fixed complete E-9 salary guarantee. Individual standard labor contracts (*표준근로계약서*) negotiated between foreign workers and Korean employers may specify higher contractual base wages or industry-specific hazard/skill allowances depending on sector (manufacturing, agriculture/livestock, fishery, construction, or service), but cannot lawfully pay below this statutory floor. Variable performance bonuses, overtime pay (1.5× hourly base under Labor Standards Act Art. 56), night work premiums, and holiday premiums are excluded from the basic subsistence calculation.
- **Contract and Stay Limits:**
  - Standard employment contract: Maximum 3 years per contract.
  - Extension: One-time extension up to 1 year and 10 months with the same employer.
  - Maximum cumulative continuous stay: **4 years and 10 months (58 months)** under Act on the Employment of Foreign Workers Article 18.
  - Sending Countries: Strictly limited to 16 EPS bilateral MOU partner countries (Philippines, Mongolia, Sri Lanka, Vietnam, Thailand, Indonesia, Uzbekistan, Pakistan, Cambodia, China, Bangladesh, Kyrgyzstan, Nepal, Myanmar, Timor-Leste, Laos).
  - Re-entry restriction: Mandatory 6-month departure prior to any new E-9 contract, reduced to 1–3 months for re-hired "committed foreign workers" (*성실외국인근로자*).

---

### B. Japan — Business Manager (`p2-jp-businessmanager`)

#### Revised ISA Criteria & Exact Staffing Definitions (Effective 16 October 2025):
- **Capital Threshold:** Minimum capital or total investment increased sixfold from JPY 5,000,000 to **JPY 30,000,000** for new applicants.
- **Exact Eligible Full-Time Resident Employee Definition:**
  Under the revised Immigration Services Agency (ISA) Ministerial Ordinance on Criteria (*出入国管理及び難民認定法第七条第一項第二号の基準を定める省令 - 経営・管理の基準*), the mandatory full-time resident staff member (*常勤の職員*) is strictly defined and restricted to:
  1. **Japanese nationals (*日本国民*)**;
  2. **Foreign nationals holding a status of residence listed in Appended Table II of the Immigration Control Act (*出入国管理及び難民認定法別表第二*)**:
     - **Permanent Resident (*永住者 - Eijūsha*)**;
     - **Spouse or Child of a Japanese National (*日本人の配偶者等*)**;
     - **Spouse or Child of a Permanent Resident (*永住者の配偶者等*)**;
     - **Long-Term Resident (*定住者 - Teijūsha*)**;
  3. **Special Permanent Residents (*特別永住者*)** under the Special Act on Immigration Control.
  *(Foreign nationals residing in Japan on temporary work visas—such as Engineer/Specialist in Humanities, Skilled Labor, SSW—or student visas are strictly prohibited from counting toward this full-time staffing quota).*
- **Language Proficiency:** Representative director/applicant or full-time resident employee must demonstrate Japanese language proficiency at **CEFR B2 / JLPT N2 level or higher** (or Business Japanese Proficiency Test BJT 400+).
- **Professional / Academic Experience:** At least **3 years of business management or administration experience** (inclusive of relevant graduate study) OR hold a relevant Master's/Doctoral degree in business administration, economics, or management.
- **Certified Business Plan:** Business plan must be verified and certified by a licensed Certified Public Tax Accountant (*Zeirishi*) or Small and Medium Enterprise Management Consultant (*Chusho Kigyo Shindanshi*).
- **Physical Premises:** Dedicated independent commercial office space secured in Japan (virtual desks and residential-only addresses without separate independent commercial entrance/signage are prohibited).
- **Transitional Grace Period (Strictly Separated):**
  Foreign nationals who were granted Business Manager status prior to 16 October 2025 are permitted to renew their status under the former JPY 5M / former criteria for a **3-year transitional window extending until 16 October 2028**.

---

### C. Australia — Temporary Graduate Subclass 485 (`p2-au-grad485`)

#### Strict Separation of Two Main Streams (LIN 24/020):
- **Stream A: Post-Higher Education Work Stream** (formerly Post-Study Work stream):
  - *Qualification criteria:* Australian higher education qualification at AQF Level 7 or above: Bachelor Degree, Bachelor (Honours) Degree, Masters by Coursework, Masters by Research, or Doctoral Degree (PhD).
  - *Age limit:* **Age 35 or under** at the date of visa lodgement.
  - *Age exceptions:* **Masters by Research graduates, Doctoral Degree (PhD) graduates, and Hong Kong / British National (Overseas) (BNO) passport holders** remain eligible up to **50 years of age**.
  - *Grant Durations:*
    - Bachelor Degree: Up to **2 years**.
    - Master by Coursework: Up to **2 years**.
    - Master by Research or PhD: Up to **3 years**.
    - Indian nationals under AI-ECTA bilateral agreement: Bachelor (STEM First Class Honours) up to 3 years; Masters (coursework/research) up to 3 years; PhD up to 4 years.
    - Hong Kong and BNO passport holders: Up to **5 years**.
  - *Australian Study Requirement:* CRICOS-registered study of at least **92 weeks** completed in not less than 16 calendar months.
  - *Application Window:* Must lodge application within **6 months (182 calendar days)** of the official course completion date.
- **Stream B: Post-Vocational Education Work Stream** (formerly Graduate Work stream):
  - *Qualification criteria:* Associate Degree, Diploma, or Trade Qualification closely related to an occupation on the Medium and Long-term Strategic Skills List (MLTSSL), supported by a positive skills assessment from the designated assessing authority.
  - *Age limit:* **Age 35 or under** at the date of visa lodgement.
  - *Age exceptions:* **ONLY Hong Kong and British National (Overseas) (BNO) passport holders** remain eligible up to **50 years of age**. *(Note: Masters by Research and PhD age exceptions do NOT apply to this vocational stream).*
  - *Grant Duration:* Up to **18 months** (Hong Kong and BNO passport holders receive up to **5 years**).
  - *Australian Study Requirement:* CRICOS-registered study of at least **92 weeks** completed in not less than 16 calendar months.
  - *Application Window:* Must lodge application within **6 months (182 calendar days)** of the official course completion date.

---

### D. Canada — Start-up Visa (`p2-ca-suv`)

#### Operational Status & Public Display Mandate:
- **Operational Status:** Formally classified as **`PAUSED_FOR_NEW_INTAKE`** (Historical Archive & Pipeline Processing Only).
- **Public Display Alert:** A mandatory operational banner is displayed across all public views indicating that new applicant intake is closed. It is strictly distinguished from active pathways.
- **Intake Caps & Sunset Timeline:**
  - Effective 30 April 2024, IRCC capped processing to 10 start-ups per designated entity.
  - New application intake closed after **31 December 2025**.
  - Final transitional submission deadline for holders of 2025 Commitment Certificates closed on **30 June 2026**.
  - Applications currently in IRCC's processing inventory continue to be processed under historical regulations.
- **Historical Archived Criteria:**
  - Commitment Certificate and Letter of Support from designated angel group (CAD $75,000), venture capital fund (CAD $200,000), or business incubator.
  - CLB 5 language benchmark; LICO transferable settlement funds; active management with 10% voting rights.

---

### E. Finland — Residence Permit for an Employed Person TTOL (`p2-fi-worker`)

#### Complete 2026 Remuneration Conditions & Benefit Treatment:
- **Statutory National Minimum Floor:** **€1,600 gross per month** (effective 1 January 2025 and prevailing throughout 2026) under Aliens Act Section 72 and Migri regulations.
- **Primacy of Sectoral Collective Agreements (TES):**
  If a generally binding sectoral collective agreement (*työehtosopimus - TES*) applies to the employer's branch of activity and stipulates a higher wage for the occupational classification, **paying the higher collective agreement wage is legally mandatory**. The €1,600/month serves strictly as an absolute national statutory minimum floor below which no full-time work permit may be issued.
- **Gross Taxable Wage vs. Net Take-Home Pay:**
  The income requirement is evaluated exclusively on **gross taxable salary** before personal income tax and employee statutory social insurance deductions (*työeläkemaksu* and *työttömyysvakuutusmaksu*), NOT on net take-home pay.
- **Treatment of Supplements and Fringe Benefits (*Luontoisedut*):**
  - Only officially assessed taxable fringe benefits—specifically employer-provided housing (*asuntoetu*) or meal benefit (*ravintoetu*)—that are valued strictly in accordance with the official tax valuations determined annually by the Finnish Tax Administration (*Verohallinto*) can be counted toward the gross income requirement.
  - Discretionary performance bonuses, untaxed expense reimbursements, daily travel allowances (*päiväraha*), and overtime pay that is not guaranteed in the employment contract **CANNOT** be counted toward satisfying the subsistence threshold.
- **Two-Stage Statutory Process:**
  TE Services first conducts regional labor market testing (checking whether domestic or EU/EEA workforce is available) and confirms that wage terms comply with Finnish collective agreements; Migri then adjudicates residence permit prerequisites.

---

## 4. OFFICIAL CANONICAL SOVEREIGN URL NORMALIZATION

All redirect URLs, tracking wrappers, and generic landing pages have been replaced with direct, canonical government links:

| Pathway ID | Destination | Issuing Authority | Normalized Direct Canonical URL | Normalized Secondary Gazette / Legislative URL |
| :--- | :--- | :--- | :--- | :--- |
| `p2-kr-e9` | South Korea | MOEL & MOJ | [https://www.eps.go.kr/](https://www.eps.go.kr/) | [https://www.moel.go.kr/english/](https://www.moel.go.kr/english/) |
| `p2-jp-businessmanager` | Japan | ISA (出入国在留管理庁) | [https://www.isa.go.jp/en/applications/procedures/zairyu_nintei10_13.html](https://www.isa.go.jp/en/applications/procedures/zairyu_nintei10_13.html) | [https://www.moj.go.jp/isa/applications/status/businessmanager.html](https://www.moj.go.jp/isa/applications/status/businessmanager.html) |
| `p2-au-grad485` | Australia | Department of Home Affairs | [https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485) | [https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485/post-higher-education-work](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485/post-higher-education-work) |
| `p2-ca-suv` | Canada | IRCC | [https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html) | [https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/start-up-business.html](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/permanent-residence/economic-classes/start-up-business.html) |
| `p2-fi-worker` | Finland | Migri & TE Services | [https://migri.fi/en/residence-permit-for-an-employed-person](https://migri.fi/en/residence-permit-for-an-employed-person) | [https://migri.fi/en/income-requirement-for-employed-persons](https://migri.fi/en/income-requirement-for-employed-persons) |

---

## 5. BEFORE & AFTER CORRECTION LOG

| Pathway ID | Field / Topic | Baseline Value | Phase 3.6.9.2 Corrected Value | Statutory Authority / Calculation Basis | Effective Date | Official Canonical URL | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `p2-kr-e9` | Minimum Salary Threshold | KRW 2,096,270 / mo (preliminary 2025 rate) | **KRW 2,156,880 / month benchmark (KRW 10,320/hr × 209 paid hrs)** | Under Labor Standards Act Art. 55: `[(40 regular + 8 holiday)/7] * (365/12) = 209 hrs`. Statutory benchmark floor, not fixed ceiling. | 2026-01-01 | [eps.go.kr](https://www.eps.go.kr/) | VERIFIED |
| `p2-kr-e9` | Contract & Duration Limits | Stated as 3 years general | **Initial contract 3 years max; extendable once up to 1 yr 10 mos (cumulative stay max 4 yrs 10 mos)** | Act on Employment of Foreign Workers Art. 18; 16 EPS partner nations; mandatory 6-month departure before re-entry unless committed worker (1–3 mos). | Current Law (2026) | [eps.go.kr](https://www.eps.go.kr/) | VERIFIED |
| `p2-jp-businessmanager` | Staffing Criteria & Resident Staff Definition | Generic 1-2 resident employees without specific legal classes | **Mandatory hiring of at least 1 full-time resident employee (常勤の職員) strictly restricted to: Japanese nationals, Table II status holders (PR, Spouse/Child of Japanese, Spouse/Child of PR, Long-Term Resident), or Special PR. Work visas excluded.** | MOJ Ministerial Ordinance on Criteria (Amended 16 Oct 2025); JPY 30M capital; N2/B2 Japanese; 3 yrs experience or Master degree; CPA/SME verified business plan. | 2025-10-16 | [isa.go.jp](https://www.isa.go.jp/en/applications/procedures/zairyu_nintei10_13.html) | VERIFIED |
| `p2-jp-businessmanager` | Transitional Provisions | Conflated with new applicant requirements | **Transitional grace period strictly isolated: foreign nationals holding Business Manager status prior to 16 Oct 2025 may renew under former JPY 5M criteria for 3 years (until 16 Oct 2028).** | Cabinet Order Transitional Provisions | 2025-10-16 to 2028-10-16 | [moj.go.jp/isa](https://www.moj.go.jp/isa/applications/status/businessmanager.html) | VERIFIED |
| `p2-au-grad485` | Stream Separation: Higher Ed vs Vocational | Single blended qualification and age description | **Stream A (Post-Higher Ed): AQF 7+ Degree (Bachelor 2 yrs, Master 2-3 yrs, PhD 3 yrs; Indian AI-ECTA 2-4 yrs; HK/BNO 5 yrs). Age 35 general cap; Masters by Research, PhD, and HK/BNO up to 50. Stream B (Post-Vocational): MLTSSL Trade/Diploma (18 mos; HK/BNO 5 yrs). Age 35 general cap; ONLY HK/BNO up to 50 (Research/PhD exception does not apply).** | Migration Regulations 1994 Schedule 2 / Legislative Instrument LIN 24/020; CRICOS min 92 wks; lodge within 6 mos of course completion. | 2024-07-01 (prevailing in 2026) | [immi.homeaffairs.gov.au](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485) | VERIFIED |
| `p2-ca-suv` | Operational Status & Intake Classification | Active open intake pathway | **`PAUSED_FOR_NEW_INTAKE` as of 2026 (Historical Archive & Pipeline Processing Only). Public alert displayed.** | Ministerial Instructions 2024–2026; intake capped at 10/org from 30 April 2024; new intake sunset post-2025; transitional closed 30 June 2026. Inventory applications continue processing. | 2025-12-31 | [canada.ca](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html) | VERIFIED |
| `p2-fi-worker` | Gross Salary, Collective Agreement & Benefit Rules | €1,399/€1,430 historical rates without detailed benefit rules | **EUR 1,600 / month gross national statutory floor. Primacy of sectoral collective agreement (TES) if higher. Evaluated strictly on gross taxable salary before tax/social deductions. Only officially taxable housing/meal benefits (Verohallinto tax valuations) qualify; untaxed allowances, daily allowances, non-guaranteed overtime excluded.** | Aliens Act 301/2004 Sec 72 / Migri Income Regulations; TE Office labor market testing. | 2025-01-01 (prevailing in 2026) | [migri.fi](https://migri.fi/en/income-requirement-for-employed-persons) | VERIFIED |

---

## 6. GENERATED EXPORTS & MACHINE-READABLE ARTIFACTS

All export files were generated and validated on the local filesystem:

1. **`phase_3_6_9_2_corrected_claim_evidence_audit.csv`**: Detailed audit of all 450 claims across the five corrected pathways with updated statutory parameters and direct government URLs.
2. **`phase_3_6_9_2_direct_source_registry.csv`**: Direct canonical sovereign source registry for the five pathways (10 direct official URLs, access check date 2026-11-12).
3. **`phase_3_6_9_2_numeric_claims_export.csv`**: 15 reconciled numeric claims across the five pathways with complete arithmetic proofs and statutory citations.
4. **`phase_3_6_9_2_before_after_log.csv`**: Machine-readable before/after delta log documenting baseline vs Phase 3.6.9.2 values.
5. **`phase_3_6_9_batch7_pathway_registry.csv`**: Updated 10-pathway registry with normalized URLs and `PAUSED_FOR_NEW_INTAKE` status.
6. **`phase_3_6_9_batch7_section_status.csv`**: 300 section statuses across Batch 7 (270 VERIFIED, 30 PARTIALLY_VERIFIED).
7. **`phase_3_6_9_batch7_nationality_scope_matrix.csv`**: 900 claims with audited nationality scoping.
8. **`phase_3_6_9_batch7_numeric_claims.csv`**: 30 numeric claims for Batch 7.
9. **`phase_3_6_9_batch7_claim_evidence_audit.json`**: Complete structured JSON payload (21,738 lines).
10. **`phase_3_6_9_batch7_source_registry.csv`**: 20 primary and secondary sovereign government sources.

---

## 7. PLATFORM INTEGRITY & AUTOMATION PRESERVATION

- **Production SQLite Database:** 100% untouched (0 bytes altered, no schema migrations).
- **Production Neon PostgreSQL Database:** 100% untouched (no connections or mutations).
- **Daily Ingestion Schedule:** Preserved at `30 21 * * *` UTC (03:00 IST) in `vercel.json` and admin monitoring routes.
- **Frontend & TypeScript Compilation:** Tested and verified via `compile_applet` and `lint_applet` with **0 errors**.
- **Dev Server Status:** HTTP 200 confirmed on `http://localhost:3000/`.
- **UI Dashboard:** Active at `http://localhost:3000/#/global-visa-audit` displaying Phase 3.6.9.2 badges, 108 KB recovery backup SHA-256 fingerprint, and operational notice banners.

---

## 8. STRICT STOP CONDITION ENFORCEMENT

In compliance with Phase 3.6.9.2 instructions, **Batch 8 has NOT been created or started**. Execution terminates cleanly with all five target pathways verified, normalized, and exported.
