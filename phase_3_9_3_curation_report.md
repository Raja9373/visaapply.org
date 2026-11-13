# Phase 3.9.3 — Authoritative Backlog Curation Report
**Project:** VisaApply.org | **Mode:** Authoritative Curation & Live Official Evidence Verification (Zero App/DB Edits)  
**Date (UTC):** `2026-11-13` | **Additional Spend:** `₹0` | **Batch 11 Implementation Started:** `No`

---

## 1. Executive Summary

Phase 3.9.3 replaces the `90` defective synthetic generator slots (`p2-queue-backlog-121..210`) audited in Phase 3.9.2 with an evidence-backed candidate curation registry grounded strictly in live sovereign government portals, immigration ministries, and official statutory texts.

No counts were padded or forced to `90`: **`67`** genuinely distinct real-world immigration/residency pathways were evaluated from primary sources, alongside **`2`** caught candidate-level duplicates and all **`90`** rejected synthetic placeholder stubs (`159` total classification rows in `phase_3_9_3_candidate_registry.csv`):

- **`43 VERIFIED`** genuinely unique, active pathways across `16` sovereign jurisdictions (`US, GB, NZ, SG, DE, FR, IE, NL, JP, NO, DK, SE, AT, HK, CH, CL`) with live `HTTP 200` direct non-homepage URLs, verbatim `<title>` headers, and substantive policy/statutory excerpts.
- **`10 PARTIALLY_VERIFIED`** candidates (`5` Canada IRCC/ESDC pages whose HTTP 200 & titles succeeded in Probe Pass 1 before CDN timeout on deep excerpts; `4` Australia Home Affairs SharePoint SPA pages with client-side dynamic fee/closure containers; `1` Taiwan NIA general residency guideline). Held from Batch 11.
- **`10 AWAITING_VERIFICATION`** candidates where automated retrieval hit WAF/bot-challenges (`NZ DIA Citizenship` Incapsula, `BE IBZ` JS support-ID, `SG EDB GIP` HTTP 202, `FI Migri` HTTP 403 Cloudflare) or moved/broken `HTTP 404` endpoints (`AE Retirement`, `US R-1`, `HK Dependants`, `PT Nationality` `justica.gov.pt`, `LU Family` `guichet.public.lu`, `IT Family` `vistoperitalia`). Strictly held out of active supply.
- **`1 CONFLICTING`** candidate (`p2-cand-us-tps` — U.S. Temporary Protected Status) where live `2026-10-20` USCIS alerts confirm ongoing DHS termination determinations alongside federal litigation and differing Federal Register country rules. Quarantined.
- **`3 EXPIRED`** closed/repealed investor routes verified directly against primary government/gazette notices: UK Tier 1 (Investor) (`gov.uk/tier-1-investor`), Ireland Immigrant Investor Programme (`irishimmigration.ie`), and Spain Investor Residence Visa (`BOE-A-2025-76`, Ley Orgánica 1/2025 repealing Arts. 63–67 of Ley 14/2013).
- **`2 REJECTED_DUPLICATE`** caught during candidate curation (`dup-cand-es-nomad` vs completed `p2-es-nomad`; `dup-cand-de-settlement` vs completed `p2-de-settlement`).
- **`90 REJECTED_FABRICATED_OR_UNSUPPORTED`** (`p2-queue-backlog-121..210`, reproducing Phase 3.9.2 forensic reconciliation: `84 DUPLICATE`, `4 INVALID_REFERENCE`, `2 CONFLICTING_REFERENCE`, `0` valid uncompleted records).

**Batch 11 Preflight Readiness Verdict:** **`READY`** (Proposed 10-pathway Batch 11 slate staged in `phase_3_9_3_proposed_batch11_candidates.json`; **implementation remains paused / NOT STARTED pending explicit user authorization**).

---

## 2. Preserved Platform Baselines & Zero-Edit Integrity Boundary

- **Source Files Modified:** `0` (`src/data/priority2AuditData.ts`, `src/data/priority1AuditData.ts`, `src/data/officialSourceRegistry.ts`, schemas, UI components, sitemaps, and public catalog untouched).
- **Completed Baseline Preserved:** `120` completed Priority 2 pathways (Batches 0–10), `142` Priority 1 pathways, `249` destination countries/territories, `30`-section profile schema, `22` special topics schema, `15` supported languages.
- **Database & Scheduling Integrity:** Production deployment = **Not Performed**; SQLite / Neon DB = **Unmodified**; Cron Schedule in `vercel.json` = **`30 21 * * * UTC`** (Preserved).
- **Additional Spend:** **`₹0`** (zero paid APIs, zero third-party aggregators, zero new npm dependencies).

---

## 3. Classification Breakdown Across `phase_3_9_3_candidate_registry.csv`

| Classification Status | Count | Batch-11 Eligibility | Summary Rationale |
|---|---:|---|---|
| **`VERIFIED`** | **`43`** | **Eligible** (`10` proposed for Batch 11; `33` surplus for Batches 12–15) | Live `HTTP 200` direct non-homepage URL, verbatim `<title>`, substantive body/statutory text, `0` P1/P2/sibling collisions, no active closure or legal conflict. |
| **`PARTIALLY_VERIFIED`** | **`10`** | Excluded (`HOLD_PARTIAL`) | `5` CA (HTTP 200 titles observed before Akamai CDN timeout on excerpt); `4` AU (HTTP 200 SharePoint SPA hiding fees/closure dynamically); `1` TW (general guidelines URL). |
| **`AWAITING_VERIFICATION`** | **`10`** | Excluded (`HOLD_WAF_OR_404`) | Blocked by Cloudflare/Incapsula/JS bot challenges (`FI, NZ-CIT, BE, SG-GIP`) or `HTTP 404` broken slugs (`AE, US-R1, HK-DEP, PT-CIT, LU, IT`). |
| **`CONFLICTING`** | **`1`** | Excluded (`QUARANTINE_CONFLICT`) | `p2-cand-us-tps` (`US` TPS): USCIS `2026-10-20` page documents conflicting DHS terminations vs federal court litigation/reinstatement rules. |
| **`EXPIRED`** | **`3`** | Excluded (`QUARANTINE_EXPIRED`) | Live official confirmation of program closure or statutory repeal (`GB Tier 1 Investor`, `IE IIP`, `ES Golden Visa` via `BOE-A-2025-76`). |
| **Subtotal — Real Candidates Evaluated** | **`67`** | — | Genuine real-world pathways inspected (neither padded nor backfilled to `90`). |
| **`REJECTED_DUPLICATE`** | **`2`** | Rejected (`REJECTED_DUPLICATE`) | `dup-cand-es-nomad` (matches `p2-es-nomad`); `dup-cand-de-settlement` (matches `p2-de-settlement`). |
| **`REJECTED_FABRICATED_OR_UNSUPPORTED`** | **`90`** | Rejected (`REJECTED_FABRICATED_OR_UNSUPPORTED`) | All `90` synthetic `remainingTemplates[i % 6]` queue slots (`p2-queue-backlog-121..210`). |
| **Total Registry Rows** | **`159`** | — | Full auditable accounting across candidates, caught duplicates, and rejected placeholders. |

---

## 4. Proposed Batch 11 Candidate Manifest (`phase_3_9_3_proposed_batch11_candidates.json`)

Status: **`READY_FOR_AUTHORIZATION`** (`implementationStarted: false`). Replaces synthetic slots `p2-queue-backlog-121..130` with **10 distinct countries** across North America, Europe, UK, APAC, and Latin America covering **7 categories**:

| # | Replaces | Proposed ID | Country | Category | Official Pathway Name | Direct Verified URL (`HTTP 200`) |
|---:|---|---|---|---|---|---|
| 1 | `#121` | `p2-cand-us-n400` | United States (`US`) | Citizenship / Naturalisation | Apply for Naturalization (Form N-400) | `uscis.gov/citizenship/apply-for-naturalization` |
| 2 | `#122` | `p2-cand-gb-seasonal` | United Kingdom (`GB`) | Seasonal / Temporary Work | Seasonal Worker Visa (Temporary Work) | `gov.uk/seasonal-worker-visa` |
| 3 | `#123` | `p2-cand-nz-aip` | New Zealand (`NZ`) | Investor / Business | Active Investor Plus Visa | `immigration.govt.nz/visas/active-investor-plus-visa/` |
| 4 | `#124` | `p2-cand-sg-dp` | Singapore (`SG`) | Family | Dependant's Pass (DP) | `mom.gov.sg/passes-and-permits/dependants-pass` |
| 5 | `#125` | `p2-cand-de-18d-research` | Germany (`DE`) | Work / Research | Residence Permit for Research (§ 18d AufenthG) | `gesetze-im-internet.de/aufenthg_2004/__18d.html` |
| 6 | `#126` | `p2-cand-fr-vpf` | France (`FR`) | Family | Carte de séjour « vie privée et familiale » | `service-public.gouv.fr/particuliers/vosdroits/F2209` |
| 7 | `#127` | `p2-cand-ie-stamp1g` | Ireland (`IE`) | Student / Post-Study | Third Level Graduate Programme (Stamp 1G) | `irishimmigration.ie/.../third-level-graduate-programme/` |
| 8 | `#128` | `p2-cand-hk-gep` | Hong Kong (`HK`) | Work / Skilled | General Employment Policy (GEP) | `immd.gov.hk/eng/services/visas/GEP.html` |
| 9 | `#129` | `p2-cand-jp-pr` | Japan (`JP`) | PR / Settlement | Permanent Residence Permission (`永住許可申請`) | `moj.go.jp/isa/applications/procedures/16-4.html` |
| 10 | `#130` | `p2-cand-cl-definitiva` | Chile (`CL`) | PR / Settlement | Permanent Residence (`Residencia Definitiva`) | `serviciomigraciones.cl/residencia-definitiva/` |

*Additional `33` `VERIFIED` candidates remain available in `phase_3_9_3_candidate_registry.csv` for future Batch 12–15 curation, leaving a net remaining curation gap of `47` routes (`90 − 43`) to reach the `210` Priority 2 ceiling once Gulf, African, Latin American, and ASEAN sovereign portals are expanded beyond `officialSourceRegistry.ts`'s `14` Tier-1 hubs.*

---

## 5. Deduplication, Historical Overlaps & Systemic Source-Registry Findings

1. **Zero Candidate Collisions Verified:** All `67` non-rejected real candidates have `0` ID collisions, `0` `canonicalUrl` collisions, and `0` direct official URL collisions against all `120` completed P2 records, all `142` P1 records, and each other.
2. **Historical Overlaps Recorded (`REVIEW_ONLY_PRESERVED_UNTOUCHED`):**
   - P1 ↔ P2 canonical URL overlaps preserved untouched: `p1-gb-scaleup` ↔ `p2-uk-scaleup`; `p1-audit-*` (IE CSEP) ↔ `p2-ie-criticalskills`.
   - P1 ↔ P2 / P2 ↔ P2 substantive route overlaps under separate slugs preserved untouched: `p1-sg-onepass` ↔ `p2-sg-onepass`; `p1-pt-d8` ↔ `p2-pt-d8`; `p1-ae-golden` ↔ `p2-ae-goldenresidence`; `p1-us-o1-stem` ↔ `p2-us-o1`; `p2-sg-compass` ↔ `p2-sg-ep`; `p2-es-pac` ↔ `p2-es-highlyskilled`.
3. **Broken/Stale Links Flagged in `src/data/officialSourceRegistry.ts` (Read-Only):**
   - `235 / 249` countries in `officialSourceRegistry.ts` still point to synthetic `www.gov.<cc>/immigration` + Wikipedia fallbacks rather than verified sovereign URLs.
   - Within the `14` Tier-1 entries, `PT.citizenship` (`justica.gov.pt`), `JP.work/digital_nomad` (`highlyskilled.html`), `IT.primaryGovUrl` (`vistoperitalia.esteri.it` EN gateway), and `AU.business` (closed `188`) exhibited `HTTP 404` or SPA/closure defects during live probing. Preserved untouched per Phase 3.9.3 preservation rules and documented in `phase_3_9_3_duplicate_and_coverage_review.csv`.

---

## 6. Deliverables & Verification Summary

- `phase_3_9_3_curation_report.md` (this report)
- `phase_3_9_3_candidate_registry.csv` (`159` classified rows)
- `phase_3_9_3_official_source_evidence.csv` (`72` live probe records with verbatim `<title>`, `http_status`, and `supporting_excerpt`)
- `phase_3_9_3_duplicate_and_coverage_review.csv` (`173` dedup, historical overlap, legacy rejection, and registry gap rows)
- `phase_3_9_3_proposed_batch11_candidates.json` (Staged `10`-pathway Batch 11 proposal, `implementationStarted: false`)
- `phase_3_9_3_change_manifest.json` (Audit proof of `0` source/DB/cron modifications)

---

## MANDATORY FINAL STATUS SUMMARY

- **Phase 3.9.3 Status:** COMPLETE  
- **Legacy placeholder slots rejected:** 90 (`p2-queue-backlog-121..210`: 84 duplicate, 4 invalid reference, 2 conflicting reference)  
- **Genuine unique candidates curated:** 67 evaluated (`43 VERIFIED`, `10 PARTIALLY_VERIFIED`, `10 AWAITING_VERIFICATION`, `1 CONFLICTING`, `3 EXPIRED`), plus `2 REJECTED_DUPLICATE` caught during curation (`69` real probes + `90` rejected stubs = `159` registry rows)  
- **Candidate verification breakdown (Verified / Partially Verified / Awaiting Verification / Conflicting / Expired / Rejected duplicates / Rejected unsupported):** `43 / 10 / 10 / 1 / 3 / 2 / 90` (with `8` historical P1/P2 overlaps also logged for review and preserved untouched)  
- **Batch 11 proposed pathways ready:** 10 (`p2-cand-us-n400`, `p2-cand-gb-seasonal`, `p2-cand-nz-aip`, `p2-cand-sg-dp`, `p2-cand-de-18d-research`, `p2-cand-fr-vpf`, `p2-cand-ie-stamp1g`, `p2-cand-hk-gep`, `p2-cand-jp-pr`, `p2-cand-cl-definitiva`)  
- **Batch 11 readiness:** READY (Pending explicit user authorization; `implementationStarted: false`)  
- **New pathways implemented:** 0 (Strict hold respected; completed baseline remains 120)  
- **Production deployment / migration:** NOT PERFORMED  
- **Additional spend:** ₹0  
- **Next step:** Explicit user review and authorization of `phase_3_9_3_proposed_batch11_candidates.json` before starting Batch 11 implementation.
