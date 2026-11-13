# Phase 3.9.1 — Targeted Fee Integrity Cleanup Report (Post Batch 10)
**Scope:** Strictly limited to **Singapore — EntrePass (`p2-sg-entrepass`)** and **Hong Kong — IANG (`p2-hk-iang`)**  
**Date Completed (UTC):** `2026-11-13` | **Budget Spent:** `₹0` | **Batch 11 Started:** `No`

---

## Section A — Executive Summary & Preserved Baselines

- **Pre-Change Recovery Backup (Verified Before Any Code Edit):**
  - Path: `/app/applet/backup_phase_3_9_1.tar.gz`
  - Size: `175,993` bytes (`~171.9 KB`)
  - SHA-256: `7424b6a0b2abf7b39eb9292b7a29efb7dfc2ce2763a9b3b223a7d33f228f4b7b`
- **Preserved Platform Baselines:**
  - Priority 2 Progress: **`120 / 210`** pathways completed (`57.14%`), **`90`** remaining in backlog (`p2-queue-backlog-121..210`), **`3,600`** cumulative section entries (`120 × 30`).
  - Batch 10 Counts Unchanged: **`10`** pathways, **`900`** total claims (**`846`** published / **`54`** quarantined: `740 VERIFIED`, `67 PARTIALLY_VERIFIED`, `50 AWAITING_VERIFICATION`, `0 CONFLICTING`, `4 EXPIRED`, `39 NOT_APPLICABLE`), **`300`** sections (`231 VERIFIED`, `58 PARTIALLY_VERIFIED`, `11 AWAITING_VERIFICATION`).
  - Scope Matrix Update from Fee Accuracy Corrections:
    - Before Phase 3.9.1: `688 GLOBAL`, `27 NATIONALITY_GROUP`, `36 NATIONALITY_SPECIFIC`, `104 RESIDENCE_SPECIFIC`, `35 CONSULAR_JURISDICTION_SPECIFIC`, `10 UNKNOWN`.
    - After Phase 3.9.1: **`686 GLOBAL`**, `27 NATIONALITY_GROUP`, **`37 NATIONALITY_SPECIFIC`**, **`105 RESIDENCE_SPECIFIC`**, `35 CONSULAR_JURISDICTION_SPECIFIC`, `10 UNKNOWN`.
  - Infrastructure Preservation: Zero changes to Batches 0–9, zero changes to the other 8 Batch 10 pathways, zero production deployment or DB migrations, SQLite & Neon test DB untouched, and `vercel.json` cron **`30 21 * * * UTC`** preserved.

---

## Section B — Workstream A: Singapore — EntrePass (`p2-sg-entrepass`)

### Official Live Source Audit (`2026-11-13`)
- Verified `HTTP 200` on:
  - `https://www.mom.gov.sg/passes-and-permits/entrepass` (Last Updated: `14 August 2026`)
  - `https://www.mom.gov.sg/passes-and-permits/entrepass/key-facts` (Last Updated: `19 November 2024` — duration/salary/levy rules only; **no fee schedule**)
  - `https://www.mom.gov.sg/passes-and-permits/entrepass/apply-for-a-pass` (Last Updated: `7 July 2026`)
  - `https://www.mom.gov.sg/passes-and-permits/entrepass/renew-a-pass` (Last Updated: `1 January 2026`)
  - `https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements` (Last Updated: `28 October 2026`)

### Separated Statutory Fee Structure
1. **Upfront Initial Application Submission Fee (`CLM-SG-B10-S18-1`, `GLOBAL`):**
   - **`SGD 105`** per pass paid upfront when submitting an initial EntrePass application (`Visa`, `Mastercard`, or `Amex`).
   - MOM's `/renew-a-pass` page lists issuance/MJV fees without a separate `SGD 105` renewal submission fee.
   - *Refundability Honesty Check:* MOM states simultaneous family-pass application fees are forfeited if the main EntrePass is rejected; no separate principal `$105` refund clause is disclosed on MOM's EntrePass pages (`mom.gov.sg/faq/work-passes` returned `HTTP 404`), so no principal refund guarantee was invented.
2. **Pass Issuance / Renewal Fee (`CLM-SG-B10-S18-2`, `GLOBAL`):**
   - **`SGD 225`** per pass paid upon approval when getting the pass issued or renewed (`GIRO`, `Visa`, `Mastercard`, `Amex`, or `NETS`/`CashCard` at EPSC for non-Singpass). Unneeded card replacement/return fee: `SGD 65.40` (incl. GST).
3. **Conditional Multiple Journey Visa (MJV) Fee (`CLM-SG-B10-S18-3`, `NATIONALITY_SPECIFIC`):**
   - **`SGD 30`** per pass (*"if applicable"*), paid at issuance/renewal **only** for passport/travel document holders requiring a Singapore entry visa under ICA guidelines (`SGD 0` MJV for visa-free nationalities). Never rolled into a universal mandatory total.

---

## Section C — Workstream B: Hong Kong — IANG (`p2-hk-iang`)

### Official Live Source Audit (`2026-11-13`)
- Verified `HTTP 200` on:
  - `https://www.immd.gov.hk/eng/services/visas/IANG.html` (Revision Date: `29-04-2026`)
  - `https://www.immd.gov.hk/eng/specifiedschemes.html` (Revision Date: `20-10-2025` — statutory commencement **`26 February 2025 at 11:00 a.m.`** under Cap. 115A Schedule 2 reg. `11(6)`)
  - `https://www.immd.gov.hk/eng/services/fee-tables/index.html` (Revision Date: `08-04-2026` — Visas Items `1(a)`, `3(a)`, `6`; Entry Permit Item `6(a)`)
- Recorded **`HTTP 404`** on legacy `https://www.immd.gov.hk/eng/services/fees/visas.html` — excluded from active citations.

### Separated Statutory Fee Structure (Principal Applicant & Each Dependant Separately)
1. **Upfront Non-Refundable Application Fee (`CLM-HK-B10-S18-1`, `GLOBAL`):**
   - **`HKD 600`** per application, mandatory upfront for **both** the principal applicant and each dependant on **every** initial IANG entry and extension / change of condition of stay (effective `26 February 2025 at 11:00 a.m.`, correcting the erroneous `"2026 two-tier"` wording).
   - Strictly **non-refundable in any circumstance** irrespective of application result, refusal, cancellation, or withdrawal (`Note 3`, `Q3`, `Q4`), and explicitly flagged as **not the complete cost**.
2. **Two-Tiered Approval Issuance Fee (`CLM-HK-B10-S18-2`, `RESIDENCE_SPECIFIC`):**
   - **`HKD 1,300`** per person if the permitted stay / `"relevant period"` is **more than 180 days** (explicit note: *if 6 months or more, `$1,300` applies*; e.g., 24-month initial stay = `HKD 600` app + `HKD 1,300` issuance = **`HKD 1,900`** total per person).
   - **`HKD 600`** per person if the relevant period is **not more than 180 days** (`HKD 600` app + `HKD 600` issuance = **`HKD 1,200`** total). Computed under Table 3 rules for extensions.
3. **Extension / Change-of-Stay Payment & Presence Rule (`CLM-HK-B10-S18-3`, `RESIDENCE_SPECIFIC`):**
   - Same `HKD 600` application + `HKD 1,300` (`>180d`) / `HKD 600` (`<=180d`) structure applies on `3+3` or `6-year` top-tier (`>=HKD 2M`) renewals and employer changes. Paid online via GovHK / ImmD Mobile App (`VISA`, `Mastercard`, `UnionPay`, `JCB`, `PPS`, `FPS`, `Alipay`, `WeChat Pay`, `UnionPay App`) for `"e-Visa"` download; **extension applicants must be physically present in Hong Kong at payment and e-Visa collection**.

---

## Section D — UI & Sanitizer Compliance

- Updated `src/data/singaporeVisas.ts` (`in-to-sg-work-009`, `in-to-sg-biz-004`, `in-to-sg-leg-002`) so public EntrePass records no longer display truncated `"SGD 105"` and instead separate initial application (`SGD 105`), issuance/renewal (`SGD 225`), and conditional MJV (`+ SGD 30 if visa-requiring passport`) with direct MOM `/apply-for-a-pass` URL.
- Upgraded `src/components/VisaDetailRenderer.tsx` Section 18 renderer backward-compatibly to support separated application, approval/issuance, and conditional fees, effective dates, refundability, and `Last Verified` dates.
- Updated `src/pages/GlobalVisaCoverageAuditPage.tsx` with accurate `686 / 37 / 105` Batch 10 scope counts and dedicated separated Fee Schedule cards for `p2-sg-entrepass` and `p2-hk-iang`.
- Verified `sanitizeVisaDetailsForPublic` strips `reviewerNotes`, `internalReviewNotes`, `correctiveClassificationNotes`, `reviewer`, and `editorId`, and filters out `isQuarantined === true`.

---

## Section E — Machine-Readable Deliverables Created

1. `phase_3_9_1_singapore_entrepass_fee_review.csv`
2. `phase_3_9_1_hongkong_iang_fee_review.csv`
3. `phase_3_9_1_fee_source_registry.csv`
4. `phase_3_9_1_change_manifest.json`
5. `phase_3_9_1_report.md`
6. `/app/applet/backup_phase_3_9_1.tar.gz`

---

## Section F — Targeted Validation, Build, Lint & Runtime Smoke Results

- Targeted Phase 3.9.1 20-assertion validation script executed against updated exports, source files, sanitizer, backup checksum, and cron schedule.
- Existing security/sanitizer smoke check verified cleanly.
- `compile_applet` and `lint_applet` co-executed with zero errors.
- Live dev server HTTP 200 smoke check verified on `http://localhost:3000/`.

---

## Section G — Hard Stop Gate

Phase 3.9.1 fee integrity cleanup is complete and verified. **Batch 11 has NOT been started.**
