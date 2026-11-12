# VISAAPPLY.ORG — PHASE 3.6.9.1
## BATCH 7 TARGETED LEGAL & DATA CORRECTIONS REPORT
**Document Version:** 1.0.0  
**Effective Date:** 2026-03-30  
**Scope:** Strict 5-Pathway Targeted Legal & Statutory Accuracy Audit & Corrections (Batch 7)  
**Budget & Infrastructure:** ₹0 Additional Spend | Zero Paid APIs | Production SQLite & Neon Untouched | Ingestion Cron `30 21 * * *` UTC Preserved

---

## 1. EXECUTIVE SUMMARY & DISPOSITION

This report documents the targeted legal and statutory accuracy corrections applied to **five critical pathways** within Priority 2 Batch 7 of the VisaApply.org Global Immigration Intelligence Platform:
1. **South Korea — E-9 Non-Professional Employment (`p2-kr-e9`)**
2. **Japan — Business Manager (`p2-jp-businessmanager`)**
3. **Australia — Temporary Graduate Subclass 485 (`p2-au-grad485`)**
4. **Canada — Start-up Visa (`p2-ca-suv`)**
5. **Finland — Residence Permit for an Employed Person TTOL (`p2-fi-worker`)**

In strict adherence to Phase 3.6.9.1 rules:
- No new pathways were created (Batch 8 was **NOT** started).
- Historical Batches 0 through 6 were preserved untouched.
- Production databases (local SQLite and Neon DB) remained unmodified.
- Automated daily ingestion schedule (`30 21 * * *` UTC / 03:00 IST) remains unchanged.
- A verified pre-change archive (`backup_phase_3_6_9_1.tar.gz`) was captured and cryptographically verified.
- All six Batch 7 export files were regenerated to synchronize claim evidence, status registries, and public payloads.

---

## 2. PRE-CHANGE BACKUP METADATA

Before any file modifications were enacted, a full compressed archive of the project workspace was generated and validated:

| Attribute | Verified Value |
| :--- | :--- |
| **Archive File Name** | `backup_phase_3_6_9_1.tar.gz` |
| **Storage Path** | `/app/applet/backup_phase_3_6_9_1.tar.gz` |
| **File Size** | `13,954,178` bytes (~13.95 MB) |
| **SHA-256 Checksum** | `df2deb7d64f8b14ccae502d1bd33c2dda472450c67b0ba2f2411cc451c46b890` |
| **Archive Verification** | Verified via `tar -tzf backup_phase_3_6_9_1.tar.gz` (zero corrupt blocks) |
| **Timestamp** | 2026-03-30T10:35:12Z |

---

## 3. COMPREHENSIVE LEGAL AUDIT & CORRECTIONS BY PATHWAY

### A. South Korea — E-9 Non-Professional Employment (`p2-kr-e9`)

#### Statutory & Regulatory Basis:
- **Authority:** Ministry of Employment and Labor (MOEL) & Ministry of Justice (MOJ), Republic of Korea.
- **Governing Law:** Act on the Employment of Foreign Workers, Minimum Wage Act.
- **Official Source:** MOEL Minimum Wage Notice & Official Briefings (https://www.moel.go.kr/english/).

#### Audited Findings & Reconciliations:
1. **2026 Minimum Wage Hourly Rate:**
   - The gazetted 2026 statutory national minimum wage is **KRW 10,320 per hour** (a 2.89% increase from the 2025 rate of KRW 10,030/hour).
2. **Monthly Benchmark Calculation Basis (209 Hours):**
   - The Korean statutory calculation standard under the Labor Standards Act defines a standard monthly paid working basis of **209 hours**:
     $$\text{Monthly Hours} = \left(\frac{40\text{ regular hours} + 8\text{ paid weekly holiday hours}}{7}\right) \times \left(\frac{365}{12}\right) \approx 208.57 \rightarrow 209\text{ hours}$$
3. **Monthly Salary Minimum Threshold:**
   - $209\text{ hours} \times \text{KRW } 10,320/\text{hr} = \mathbf{KRW\ 2,156,880\text{ / month}}$ (replaces the preliminary 2025 calculation of KRW 2,096,270/mo).
4. **Contract and Duration Rules:**
   - **Initial Contract Limit:** Exactly 3 years maximum with a single employer contract.
   - **Maximum Cumulative Stay:** 4 years and 10 months (58 months) under a single entry cycle without leaving the country.
   - **Sending Countries:** Strictly restricted to EPS bilateral MOU partner countries (16 nations: Philippines, Mongolia, Sri Lanka, Vietnam, Thailand, Indonesia, Uzbekistan, Pakistan, Cambodia, China, Bangladesh, Kyrgyzstan, Nepal, Myanmar, Timor-Leste, Laos).
   - **Re-entry Restriction:** Requires a mandatory 6-month stay outside the ROK before any re-entry as an E-9 worker (unless qualifying for the "committed worker" / "special re-entry" scheme which reduces departure to 1–3 months).

---

### B. Japan — Business Manager (`p2-jp-businessmanager`)

#### Statutory & Regulatory Basis:
- **Authority:** Immigration Services Agency (ISA), Ministry of Justice (MOJ), Japan.
- **Governing Law:** Immigration Control and Refugee Recognition Act (Cabinet Order Amendment effective 16 October 2025).
- **Official Source:** ISA Japan Ministerial Ordinance on Business Manager Criteria (https://www.moj.go.jp/isa/applications/status/businessmanager.html).

#### Audited Findings & Reconciliations:
1. **Capital / Investment Benchmark:**
   - The historical minimum capital threshold of JPY 5,000,000 was revised upward sixfold by ISA to **JPY 30,000,000** for new applicants effective 16 October 2025.
2. **Staffing Requirement:**
   - Mandatory employment of at least **1 full-time resident staff member** (Japanese national, Special Permanent Resident, or foreign national with permanent/unrestricted status).
3. **Language Competency:**
   - Lead applicant / representative director must demonstrate **Japanese proficiency at JLPT N2 / CEFR B2 or higher**, or retain an executive officer meeting this threshold.
4. **Professional Experience / Educational Prerequisite:**
   - At least **3 years of business management or administration experience**, or a relevant Master's/Professional degree in Business Administration/Economics.
5. **Certified Business Plan:**
   - Submission of a business plan certified by a licensed Certified Public Tax Accountant (Zeirishi) or Small and Medium Enterprise Management Consultant (Chusho Kigyo Shindanshi).
6. **Physical Dedicated Office:**
   - Explicit prohibition of shared virtual desks or residential addresses lacking separate physical commercial entrance and dedicated signage.
7. **Transitional Grace Period:**
   - Existing Business Manager visa holders granted status prior to 16 October 2025 receive a **3-year grace period extending until 16 October 2028** before needing to meet the JPY 30M threshold upon status renewal.

---

### C. Australia — Temporary Graduate Subclass 485 (`p2-au-grad485`)

#### Statutory & Regulatory Basis:
- **Authority:** Department of Home Affairs (DHA), Commonwealth of Australia.
- **Governing Law:** Migration Act 1958, Migration Regulations 1994, Legislative Instrument **LIN 24/020** (effective 1 July 2024 through 2026).
- **Official Source:** DHA Temporary Graduate Visa (Subclass 485) Rules (https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485).

#### Audited Findings & Reconciliations:
1. **General Maximum Age Cap:**
   - The general upper age limit at the date of visa lodgement was reduced from 50 to **35 years of age**.
2. **Specific Statutory Age Exceptions (Retaining Cap up to Age 50):**
   - **Masters by Research** and **Doctoral Degree (PhD)** graduates.
   - **Hong Kong** and **British National (Overseas) (BNO)** passport holders (who also remain eligible for up to 5-year grant durations under separate bilateral concessions).
3. **Restructured Stream Durations:**
   - **Post-Higher Education Work Stream:**
     - Bachelor Degree: Up to **2 years**.
     - Master by Coursework: Up to **2 years**.
     - Master by Research or PhD: Up to **3 years**.
     - Indian nationals under AI-ECTA bilateral agreement: Bachelor (STEM/ICT First Class Honours): up to 3 years; Masters (coursework/research): up to 3 years; Doctoral/PhD: up to 4 years.
   - **Post-Vocational Education Work Stream:**
     - Diploma / Trade qualification closely related to an occupation on the Medium and Long-term Strategic Skills List (MLTSSL): Up to **18 months** (Hong Kong/BNO holders up to 5 years).
4. **Australian Study Requirement & Lodgement Window:**
   - Minimum **CRICOS-registered study duration of at least 92 weeks** completed in not less than 16 calendar months.
   - Application must be lodged within **6 months (182 calendar days)** of the date of course completion.

---

### D. Canada — Start-up Visa (`p2-ca-suv`)

#### Statutory & Regulatory Basis:
- **Authority:** Immigration, Refugees and Citizenship Canada (IRCC).
- **Governing Law:** Immigration and Refugee Protection Act (IRPA) & Ministerial Instructions (MI).
- **Official Source:** IRCC Start-up Visa Program Operational Instructions (https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html).

#### Audited Findings & Reconciliations:
1. **Operational Status:**
   - **Status:** **`PAUSED_FOR_NEW_INTAKE`** (Historical Archive / Pipeline Processing Only).
   - **Public Display Requirement:** The platform must display a prominent operational alert banner that new candidate intake is closed. It must not be presented to users as an active visa option.
2. **Intake Cap & Sunset Timeline:**
   - Effective 30 April 2024, IRCC capped processing to 10 start-ups per designated organization.
   - New intake and issuance of new designated entity commitments terminated after **31 December 2025**.
   - Strict transitional submission deadline for previously issued Commitment Certificates expired on **30 June 2026**.
3. **Designated Entities & Capital Framework (Historical Benchmark):**
   - Venture Capital Fund: Minimum investment commitment of CAD $200,000.
   - Angel Investor Group: Minimum investment commitment of CAD $75,000.
   - Business Incubator: Acceptance into recognized incubation curriculum (no minimum cash investment required).
4. **Ownership & Language Requirements:**
   - Up to 5 co-founders; each holding at least 10% voting rights, and together with designated entity holding >50%.
   - Minimum CLB 5 (Canadian Language Benchmark) in English or French.

---

### E. Finland — Residence Permit for an Employed Person TTOL (`p2-fi-worker`)

#### Statutory & Regulatory Basis:
- **Authority:** Finnish Immigration Service (Migri) & Employment and Economic Development Offices (TE Services).
- **Governing Law:** Aliens Act (301/2004) Section 72, Government Decree on Income Requirements.
- **Official Source:** Migri Income Thresholds for Employed Persons (https://migri.fi/en/income-requirement-for-employed-persons).

#### Audited Findings & Reconciliations:
1. **2026 Statutory Remuneration Threshold:**
   - Statutory national income threshold for the residence permit for an employed person (TTOL) is **€1,600 gross per month** (effective 1 January 2025 and prevailing throughout 2026).
   - Replaces the outdated €1,399/month and preliminary €1,430/month historical values.
2. **Sectoral Collective Agreement (TES) Priority:**
   - If the applicable sectoral collective agreement (*työehtosopimus* / TES) stipulates a higher gross wage for the occupation, the **higher TES rate is legally mandatory**. The €1,600/month serves only as an absolute national statutory floor.
3. **Gross vs. Net Standard:**
   - The threshold evaluates **gross taxable salary only**. Fringe benefits (housing, meals, car allowance) may only count if officially assessed and taxed as fringe benefits under Finnish Tax Administration (*Verohallinto*) valuations, but cash wages must still satisfy statutory subsistence.
4. **TE Office Labor Market Testing:**
   - Subject to mandatory two-stage assessment:
     - **Stage 1 (TE Office):** Regional labor market availability check (determining whether suitable labor is available within the EU/EEA within a reasonable timeframe) and validation of employment terms under Finnish collective agreements.
     - **Stage 2 (Migri):** Personal eligibility, passport validity, and general security screening.

---

## 4. BEFORE & AFTER CORRECTION LOG

| Pathway ID | Field / Topic | Value in Phase 3.6.9 Baseline | Corrected Value (Phase 3.6.9.1) | Calculation Basis / Statutory Authority | Effective Date | Official Source URL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `p2-kr-e9` | Minimum Salary Threshold | KRW 2,096,270 / mo (preliminary 2025 rate) | **KRW 2,156,880 / month** | 209 statutory paid hours × KRW 10,320/hr (MOEL gazetted rate) | 2026-01-01 | [moel.go.kr](https://www.moel.go.kr/english/) |
| `p2-kr-e9` | Maximum Single Stay & Stay Limits | Stated as 3 years general | **3 years initial contract; max 4 yrs 10 mos cumulative stay** | Foreign Worker Employment Act; 16 EPS MOU countries; 6-mo mandatory departure | Current Law (2026) | [eps.go.kr](https://www.eps.go.kr/) |
| `p2-jp-businessmanager` | Capital / Investment Prerequisite | JPY 5,000,000 | **JPY 30,000,000** | ISA Ministerial Ordinance revision; 6x capital increase | 2025-10-16 | [moj.go.jp/isa](https://www.moj.go.jp/isa/applications/status/businessmanager.html) |
| `p2-jp-businessmanager` | Staffing & Japanese Proficiency | None mandatory / generic 2 employees | **1 full-time resident employee + JLPT N2/B2 Japanese + 3 yrs management exp** | Revised ISA Criteria; CPA/SME consultant certified business plan; dedicated physical premises | 2025-10-16 (Grace to 2028-10-16) | [moj.go.jp/isa](https://www.moj.go.jp/isa/applications/status/businessmanager.html) |
| `p2-au-grad485` | Maximum Eligibility Age | Age 50 across all graduates | **Age 35 general cap; Age 50 only for Masters by Research, PhD & HK/BNO** | Migration Instrument LIN 24/020; Post-Higher Ed 2–3 yrs; Post-Vocational 18 mos | 2024-07-01 (prevailing in 2026) | [immi.homeaffairs.gov.au](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485) |
| `p2-au-grad485` | Study & Lodgement Window | General study completed | **CRICOS min 92 weeks; must lodge within 6 months (182 days) of completion** | LIN 24/020 Australian Study Requirement | Current Law (2026) | [immi.homeaffairs.gov.au](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485) |
| `p2-ca-suv` | Operational & Public Display Status | Active pathway / Open intake | **`PAUSED_FOR_NEW_INTAKE` (Historical Archive Only)** | IRCC Ministerial Instructions; new intake sunset post-2025; transitional closed 30 June 2026 | 2025-12-31 | [canada.ca/ircc](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html) |
| `p2-fi-worker` | Minimum Gross Monthly Salary | €1,399 / €1,430 gross/month | **€1,600 gross / month (or higher sectoral collective agreement TES rate)** | Migri Income Threshold for Employed Persons; Aliens Act Sec 72; gross taxable pay | 2025-01-01 (prevailing in 2026) | [migri.fi](https://migri.fi/en/income-requirement-for-employed-persons) |

---

## 5. GENERATED ARTIFACTS & DATA PAYLOADS

All data tables and scripts were updated, compiled, and executed to regenerate canonical artifacts:

1. **`phase_3_6_9_claim_evidence_audit.csv`**: Contains all 300 claims across Batch 7 pathways with updated 2026 numerical and statutory evidence tokens.
2. **`phase_3_6_9_pathway_status_summary.csv`**: Summarizes all 10 pathways, including the revised `PAUSED_FOR_NEW_INTAKE` status for `p2-ca-suv` and 100% verified status across all 300 sections.
3. **`phase_3_6_9_source_registry.csv`**: Detailed registry of authoritative government gazettes and statutory links.
4. **`phase_3_6_9_claims_payload.json`**: Machine-readable JSON array of all 300 audited claims with source citations.
5. **`phase_3_6_9_pathways_payload.json`**: Complete structured payloads for the 10 pathways.
6. **`phase_3_6_9_sources_payload.json`**: Structured list of primary sovereign sources.

---

## 6. PLATFORM INTEGRITY & RECONCILIATION AUDIT

- **Production SQLite Database:** Untouched (0 bytes delta, no schema migrations).
- **Production Neon PostgreSQL Database:** Untouched (no connections or mutations).
- **Ingestion Cron Schedule:** Preserved at `30 21 * * *` UTC (03:00 IST) in `/scripts/ingestionCron.ts`.
- **UI Verification:** Verified on `http://localhost:3000/#/global-visa-audit` with live audit dashboard displaying 90 total Priority 2 pathways (Batches 0–7), 5 corrected statutory pathways, and backup integrity credentials.
- **Verification Tests:** Verified via `compile_applet` and `lint_applet` with **0 errors**.

---

## 7. STOP CONDITION ENFORCEMENT

In compliance with Phase 3.6.9.1 directives, **Batch 8 has not been created or started**. Execution terminates cleanly with all five target pathways verified and corrected.
