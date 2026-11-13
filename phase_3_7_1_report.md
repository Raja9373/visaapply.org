# PHASE 3.7.1 — TARGETED INTEGRITY CLEANUP REPORT (POST BATCH 8)

**Status:** Complete | **Batch 9 Started:** NO (Stopped cleanly prior to Batch 9)  
**Budget:** ₹0 Additional Spend | **Infrastructure:** Production SQLite, Neon DB, and Cron (`30 21 * * * UTC`) Untouched

---

## A. Pre-Change Backup & Integrity Safeguards
- **Archive Path:** `/app/applet/backup_phase_3_7_1.tar.gz`
- **Archive Size:** `134,900 bytes` (~131.7 KB)
- **SHA-256:** `4a9e2ecbd76e1ade02ab4348387c9c8db412967c93cb290fdf426edd68e6bf43`
- **Excluded:** Historical `.tar.gz` archives excluded (contains only targeted files modified or synced in Phase 3.7.1).
- **Preserved Baselines:** `100 / 210` Priority 2 pathways completed (`47.62%`), `110` remaining backlog, `900` Batch 8 claims (`853` published, `47` quarantined), zero DB migrations, zero production deployments.

---

## B. Workstream A — Qatar Source Recovery (`p2-qa-workresidence`)
- **Audit Count Reconciliation:** Reconciled `priority2AuditData.ts` so `p2-qa-workresidence` accurately records `76` published + `14` quarantined section claims (`= 90` total 30-section claims) alongside `2` quarantined special topics (`t08_thirdCountryApplicationRules`, `t15_rightsWhileApplicationOrRenewalPending`), explaining the `16` quarantined items total.
- **Official Retrieval Results (`2026-11-13`):**
  - `https://portal.moi.gov.qa` → WAF `Request Rejected`
  - `https://hukoomi.gov.qa/en/services/work-visa` → `HTTP 403 Maintenance Page`
  - `https://www.mol.gov.qa` → Request timeout
  - `https://www.almeezan.qa/LawPage.aspx?id=6816&language=en` → Request timeout
  - `https://www.mofa.gov.qa/en/services/visas` → `HTTP 404`
- **Legislative Context Recorded:** **Law No. 21 of 2015 Regulating the Entry, Exit, and Residence of Expatriates** (amended by Law No. 1 of 2017, Law No. 13 of 2018, Decree-Law No. 19 of 2020; Executive Regulations Decision No. 25 of 2019): **Article 10** mandates recruiter/expatriate completion of residence/medical/QID procedures within **30 days** of entry; **Article 11** exempts short-term visits ≤30 days.
- **Resolution:** Zero forced promotions. All `14` `AWAITING_VERIFICATION` section claims and `2` special topics remain `AWAITING_VERIFICATION` and strictly quarantined (`phase_3_7_1_qatar_source_recovery.csv`).

---

## C. Workstream B — India Employment Visa Conflict Review (`p2-in-employment`)
- **Conflicting Claims Audited:** `CLM-IN-B8-S05-1` (`CONFLICTING`, quarantined), `CLM-IN-B8-S05-2` (`CONFLICTING`, quarantined), plus `CLM-IN-B8-S05-3` (`VERIFIED`, published) and `t20_immigrationLawChangesDuringProcessing` (`CONFLICTING`, quarantined).
- **Live Verification Evidence (`2026-11-13`):**
  - `https://www.cgisf.gov.in/page/employment-visa/` (`HTTP 200`): Verbatim text confirms general gross salary in excess of **Rs. 16.25 lakhs per annum**, **Rs. 3.60 lakhs p.a.** for PIO/spouses, and exemptions for ethnic Mission cooks, non-English language teachers/translators, foreign artistes, and national/state sports coaches (plus Rs. 9.10 lakhs Central Higher Ed faculty).
  - `https://www.hcikl.gov.in/pdf/EmploymentVisa.pdf` (`HTTP 200`, 3,890,077 bytes) & `https://www.eoiparis.gov.in/content/EMPLOYMENT%20VISA.pdf` (`HTTP 200`, 65,306 bytes): Consular checklists retain `USD 25,000 / Rs. 16.25 lakhs`.
  - `https://boi.gov.in/boi/` (`HTTP 200`) & `https://indianfrro.gov.in/efrro/` (`HTTP 200`): Online login portal exposes no public PDF circular overriding ₹16.25L; `https://mha.gov.in/MHA1/TourVisa.html` returned `HTTP 404`; `https://www.hcilondon.gov.in/page/employment-visa/` returned `HTTP 403` (Cloudflare); `https://investindia.gov.in/faq-pdf/59/en` returned `HTTP 403`.
- **Resolution:** Retained both `CLM-IN-B8-S05-1` and `CLM-IN-B8-S05-2` as **`CONFLICTING` and quarantined**, explicitly separating published Mission/MHA baseline (`INR 16.25L / USD 25,000`) from reported 2026 domestic FRRO renewal enforcement (`INR 24.00L`) (`phase_3_7_1_india_conflict_review.csv`).

---

## D. Workstream C — Mauritius Occupation Permit Conflict Review (`p2-mu-occupation`)
- **Claims Audited:** `CLM-MU-B8-S05-2` (`CONFLICTING`, quarantined) and `CLM-MU-B8-S05-3` (`EXPIRED`, quarantined), alongside `CLM-MU-B8-S05-1` (`VERIFIED`, published).
- **Live Statutory Evidence (`2026-11-13`):**
  - `https://edbmauritius.org/wp-content/uploads/2022/10/EDB-Act-2023.pdf` (`HTTP 200`, 337,075 bytes): First Schedule Part I **Item 5 (Self-employed person)** verbatim specifies *"Initial investment of USD 35,000 or its equivalent in freely convertible foreign currency provided that the self-employed is engaged in the services sector only"*; **Item 1 (Investor)** specified *"Initial investment of USD 50,000"* in the 2023 consolidated Act (later raised to `USD 100,000` + `MUR 5M` Yr 3 / `MUR 8M` Yr 5 turnover); **Item 3 (Professional)** specified *"Monthly basic salary of at least 30,000 rupees"* (amended by Act 12/2023 w.e.f. 1 Aug 2023, later harmonized to flat `MUR 50,000/mo`).
  - `https://business.edbmauritius.org` (NELS) & `https://residency.mu/` (`HTTP 200`); `https://edbmauritius.org/newsletter-august-2026-op` timed out on `2026-11-13` follow-up re-fetch.
- **Resolution:** Because consolidated 2025/2026 statutory amendment text shifting Self-Employed from `USD 35,000` to `USD 50,000` could not be freshly fetched after newsletter timeout, `CLM-MU-B8-S05-2` stays **`CONFLICTING` and quarantined**, and legacy MUR 30,000/45,000 tiers (`CLM-MU-B8-S05-3`) stay **`EXPIRED` and quarantined** (`phase_3_7_1_mauritius_conflict_review.csv`).

---

## E. Workstream D — Public Display & API Sanitization Fixes
- **`/src/components/VisaDetailRenderer.tsx`:**
  - Extended `renderVerificationBadge` to render all 6 verification states cleanly (`VERIFIED`, `PARTIAL` / `PARTIALLY_VERIFIED`, `CONFLICTING` / `CONFLICTING_EVIDENCE`, `EXPIRED`, `NOT_APPLICABLE`, and `AWAITING_VERIFICATION` / `AWAITING_OFFICIAL_VERIFICATION` / `UNKNOWN`). Previously `PARTIALLY_VERIFIED`, `CONFLICTING`, and `EXPIRED` fell into the default `AWAITING OFFICIAL VERIFICATION` branch.
  - Added distinct warning banners for `CONFLICTING`, `EXPIRED`, `PARTIALLY_VERIFIED`, `AWAITING_VERIFICATION`, and `NOT_APPLICABLE` across sections, special topics, and claims.
  - Suppressed `StructuredSectionContent` for `EXPIRED` and `NOT_APPLICABLE` sections, filtered `isQuarantined === true` out of `activeClaims`, and separated any `EXPIRED` claims into a dedicated **Historical / Expired Rules** warning block so expired items cannot appear as current requirements.
- **`/src/pages/CountryImmigrationDetailPage.tsx`:**
  - Replaced generic `'Audit Pending'` category label fallback with explicit `'Expired / Historical'`, `'Conflicting / Review'`, `'Not Applicable'`, `'Temporarily Closed'`, `'Verified'`, and `'Awaiting Verification'` badges, and added explicit status warning banners inside `ProgramCard`.
- **`/src/types/visaComprehensiveProfile.ts`:**
  - Added `PARTIALLY_VERIFIED`, `CONFLICTING`, `CONFLICTING_EVIDENCE`, `EXPIRED`, and `AWAITING_OFFICIAL_VERIFICATION` to `SectionVerificationState`.
  - Hardened `sanitizeVisaDetailsForPublic` to exclude `c.isQuarantined === true`, preserve non-`VERIFIED` statuses honestly, enforce `canPresentAsVerified = false` unless integrity passes, and strip `reviewerNotes`, `internalReviewNotes`, `correctiveClassificationNotes`, `reviewer`, and `editorId`.
- **`/src/pages/GlobalVisaCoverageAuditPage.tsx`:** Added distinct status pill styling for `PARTIALLY_VERIFIED` and `NOT_OFFERED`.

---

## F. Validation Results
Verified via automated TypeScript/Node integrity assertions, Vite production compilation, ESLint validation, and local dev server HTTP smoke check (exact counts preserved: `100/210` Priority 2 completed, `110` remaining, `900` Batch 8 claims, `853` published, `47` quarantined, `0` Batch 9 records, `0` duplicate IDs/URLs, `0` Google redirects).

---

## G. Explicit Stop Notice
Phase 3.7.1 is complete and verified. **Execution stopped prior to Priority 2 Batch 9.**
