# VISAAPPLY.ORG — PHASE 3.6.9.3
## FINAL BATCH 7 MICRO-CLEANUP REPORT: SOUTH KOREA E-9 (`p2-kr-e9`)
**Document Version:** 1.0.0  
**Access-Check & Verification Date:** 2026-11-13  
**Scope:** Strict Micro-Cleanup of South Korea E-9 (`p2-kr-e9`) Calculation Fields, Statutory Notice Citation, and Exact Official Evidence URLs  
**Budget & Infrastructure:** ₹0 Additional Spend | Zero Paid APIs | Production SQLite & Neon Untouched | Daily Cron `30 21 * * *` UTC (03:00 IST) Preserved | Batch 8 NOT Started

---

## 1. EXACT FIELDS CORRECTED (`p2-kr-e9` ONLY)

1. **Statutory Public Notice Citation Corrected:**
   - Replaced inaccurate citation `MOEL Public Notice No. 2025-56` with the verified official gazette citation **`MOEL Public Notice No. 2025-47` (`고용노동부 고시 제2025-47호`, gazetted 2025-08-05)** confirmed directly on the Minimum Wage Commission official notice record (`bultnId=4657`) and MOEL press release (`news_seq=18144`).
2. **2026 Minimum Wage Calculation Fields Completed (Zero Blank or Truncated Fields):**
   - Fixed the truncated 200-character `p.notes.substring(0, 200)` output in `phase_3_6_9_2_numeric_claims_export.csv` (which previously cut off mid-sentence at `"Gazetted at KRW "`) and populated complete, non-truncated calculation fields across `CLM-KR-S05-1`, `CLM-KR-S05-2`, `CLM-KR-S05-3`, `phase_3_6_9_batch7_numeric_claims.csv`, `phase_3_6_9_2_numeric_claims_export.csv`, `phase_3_6_9_2_corrected_claim_evidence_audit.csv`, `phase_3_6_9_batch7_claim_evidence_audit.json`, `src/data/priority2AuditData.ts`, `src/data/southKoreaVisas.ts` (`kr-WRK-003`), and `src/pages/GlobalVisaCoverageAuditPage.tsx`.
3. **Generic Homepage URLs Replaced with Exact Official Documents:**
   - Replaced `https://www.eps.go.kr/` and `https://www.moel.go.kr/english/` homepages on `p2-kr-e9` numeric and statutory claims with exact official Minimum Wage Commission, MOEL, MOLEG EasyLaw, and KLRI e-Law URLs directly accessed with HTTP 200 on 2026-11-13.
4. **Honest Verification Statuses Preserved (No Inflated `VERIFIED` Counts):**
   - Restored accurate `PARTIALLY_VERIFIED` status on `p2-kr-e9` sections `S04`, `S17`, and `S30` inside `phase_3_6_9_2_corrected_claim_evidence_audit.csv` and `CLM-KR-S17-1` inside `phase_3_6_9_2_numeric_claims_export.csv`, reflecting that `eps.go.kr` and `hikorea.go.kr/info/InfoStayE9.pt` returned server-side error pages on 2026-11-13 automated verification.

---

## 2. VERIFIED 2026 SOUTH KOREA MINIMUM WAGE CALCULATION & FORMULA

| Field | Verified Value |
| :--- | :--- |
| **2026 Statutory Hourly Minimum Wage** | **KRW 10,320 / hour** (+2.9% / +KRW 290 vs 2025 rate of KRW 10,030/hr) |
| **Standard Monthly Paid-Hours Calculation Basis** | **209 hours / month** (`[(40 regular weekly hours + 8 paid weekly holiday allowance hours) / 7 days] × (365 days / 12 months) = 208.57 → 209 hours`) |
| **Explicit Formula** | **`KRW 10,320 × 209 hours = KRW 2,156,880`** |
| **Monthly Result** | **KRW 2,156,880 / month** |
| **Effective Period** | **2026-01-01 to 2026-12-31** (Gazetted 2025-08-05 via MOEL Public Notice No. 2025-47) |
| **Classification & Exclusions** | Explicitly labeled as the **standard monthly minimum-wage benchmark** (statutory floor), **NOT a guaranteed complete E-9 salary**. Does **NOT** add or include overtime, night premiums, holiday premiums, or bonuses. |

---

## 3. DIRECT OFFICIAL URLS ACTUALLY ACCESSED & VERIFIED (2026-11-13)

Every URL below was directly fetched via HTTP/HTTPS on **2026-11-13** without Google redirect wrappers:

| Source Role | Source Title | Issuing Authority | Direct Canonical URL | Effective / Pub Date | Access Status (2026-11-13) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026 Minimum Wage Rate Table** | Minimum Wage Decision Status (10,320 / 82,560 / 2,156,880) | Minimum Wage Commission (최저임금위원회) | [https://www.minimumwage.go.kr/english/introduce/minWage.do](https://www.minimumwage.go.kr/english/introduce/minWage.do) | 2026-01-01 to 2026-12-31 | **HTTP 200 — VERIFIED** |
| **MOEL Official Announcement** | 2026년 적용 최저임금 시간급 10,320원 (209시간 기준 월 2,156,880원) | Ministry of Employment and Labor (MOEL / 고용노동부) | [https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18144](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18144) | 2025-08-05 | **HTTP 200 — VERIFIED** |
| **MOEL Public Notice Record** | 2026년 적용 최저임금 고시 (고용노동부 고시 제2025-47호 / Notice No. 2025-47) | Minimum Wage Commission / MOEL | [https://www.minimumwage.go.kr/customer/notice/view.do?bultnId=4657](https://www.minimumwage.go.kr/customer/notice/view.do?bultnId=4657) | 2025-08-05 | **HTTP 200 — VERIFIED** |
| **EPS E-9 Employment & Contract Rules** | Employment of Foreign Workers > Procedures for Non-professional Employment (E-9) & Standard Employment Contract | Ministry of Government Legislation (MOLEG EasyLaw) | [https://www.easylaw.go.kr/CSM/CsmOvSave.laf?csmSeq=1271&ccfNo=3&cciNo=2&cnpClsNo=1](https://www.easylaw.go.kr/CSM/CsmOvSave.laf?csmSeq=1271&ccfNo=3&cciNo=2&cnpClsNo=1) | Current Law (2026) | **HTTP 200 — VERIFIED** |
| **Primary Legislation (E-9 / EPS)** | ACT ON THE EMPLOYMENT OF FOREIGN WORKERS (Official English Translation) | Korea Legislation Research Institute (KLRI e-Law) | [https://elaw.klri.re.kr/eng_service/lawView.do?hseq=60984&lang=ENG](https://elaw.klri.re.kr/eng_service/lawView.do?hseq=60984&lang=ENG) | Current Law (2026) | **HTTP 200 — VERIFIED** |
| **Primary Legislation (Minimum Wage)** | MINIMUM WAGE ACT Articles 4–6 (Official English Translation) | Korea Legislation Research Institute (KLRI e-Law) | [https://elaw.klri.re.kr/eng_mobile/viewer.do?hseq=48699&type=part&key=1](https://elaw.klri.re.kr/eng_mobile/viewer.do?hseq=48699&type=part&key=1) | Current Law (2026) | **HTTP 200 — VERIFIED** |

---

## 4. REMAINING EVIDENCE GAPS (TRANSPARENTLY LOGGED)

| Portal / Resource | Direct URL Checked | Observed Response (2026-11-13) | Claim Disposition |
| :--- | :--- | :--- | :--- |
| **HRD Korea EPS Portal** | `https://www.eps.go.kr/` & `https://www.eps.go.kr/eo/index.html` | Returned HTTP 200 with error page `<title>:: EPS - 시스템 오류 ::</title>` (system error) | Marked **`AWAITING_VERIFICATION`** in source registry; operational SLA claims (`S17`) kept **`PARTIALLY_VERIFIED`**. |
| **MOJ HiKorea E-9 Stay Page** | `https://www.hikorea.go.kr/info/InfoStayE9.pt` | Returned HTTP 200 with error page `<title>에러</title>` (error page) | Marked **`AWAITING_VERIFICATION`** in source registry; not used as verified evidence for numeric claims. |

---

## 5. FILES CHANGED & GENERATED

### Source & Script Files Modified (Strictly Limited to `p2-kr-e9` / `kr-WRK-003` & Audit Header):
- `/scripts/executePhase369Audit.ts`
- `/src/data/priority2AuditData.ts`
- `/src/data/southKoreaVisas.ts` (`kr-WRK-003` `fundsBox` only)
- `/src/pages/GlobalVisaCoverageAuditPage.tsx`

### Regenerated Export & Report Files:
- `/phase_3_6_9_3_batch7_micro_cleanup_report.md` (new report)
- `/phase_3_6_9_batch7_claim_evidence_audit.json`
- `/phase_3_6_9_batch7_pathway_registry.csv`
- `/phase_3_6_9_batch7_numeric_claims.csv`
- `/phase_3_6_9_batch7_source_registry.csv`
- `/phase_3_6_9_2_corrected_claim_evidence_audit.csv`
- `/phase_3_6_9_2_direct_source_registry.csv`
- `/phase_3_6_9_2_numeric_claims_export.csv`
- `/phase_3_6_9_2_before_after_log.csv`

---

## 6. PRE-CHANGE RECOVERY BACKUP METADATA

| Attribute | Verified Value |
| :--- | :--- |
| **Backup Filename** | `backup_phase_3_6_9_3.tar.gz` |
| **Storage Path** | `/app/applet/backup_phase_3_6_9_3.tar.gz` |
| **File Size** | `136,288` bytes (~133.1 KB) |
| **SHA-256 Checksum** | `742d1a03fb93dc829ad072d14bcc4e213bab85b8d59a6fb8a32e6d4948747147` |
| **Prior Backups Preserved** | `backup_phase_3_6_9_1.tar.gz` and `backup_phase_3_6_9_2.tar.gz` preserved untouched |

---

## 7. TARGETED VALIDATION RESULTS

- **Arithmetic & Non-Blank Check (`node` assertion script):** Passed (`10320 * 209 = 2156880`; 0 blank fields in `p2-kr-e9` rows across 7 export files; 0 Google redirect URLs; `CLM-KR-S05-1/2/3` and `CLM-KR-S17-1/2/3` verified).
- **Direct Official URL HTTP Check (`curl`):** Verified HTTP 200 and live content for `minimumwage.go.kr`, `moel.go.kr/news`, `easylaw.go.kr`, and `elaw.klri.re.kr`; logged portal errors on `eps.go.kr` and `hikorea.go.kr/info/InfoStayE9.pt`.
- **TypeScript & Build Check:** Verified via `compile_applet` and `lint_applet` (`tsc --noEmit`).

---

## 8. PRESERVATION & STOP CONDITION CONFIRMATION

- **Other Nine Batch 7 Pathways:** Untouched and identical in legal substance.
- **Historical Batches 0–6:** Untouched.
- **Production SQLite & Neon Databases:** Untouched (0 schema changes, 0 migrations, 0 writes).
- **Automation & Routes:** Daily `30 21 * * *` UTC (03:00 IST) cron, public routes, and admin credentials untouched.
- **STOP Condition Enforced:** **Batch 8 has NOT been started.** Execution ends cleanly at Phase 3.6.9.3.
