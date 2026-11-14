# VISAAPPLY.ORG — PHASE 3.9.8: PRIORITY 2 — BATCH 12 FULL IMPLEMENTATION REPORT
## 10 Verified Immigration Pathways | 300 Profile Sections | 220 Special Topics | 900 Claims

**Date:** 2026-11-13  
**Phase:** 3.9.8 (Priority 2 — Batch 12 Full Implementation)  
**Authoritative Reconciled Baseline Input:** Phase 3.9.7.1 (`130 / 210` Priority 2 completed; Batch 11 canonical rows `121–130`)  
**Updated Priority 2 Completion:** `140 / 210` (`70` remaining target slots)  
**Additional Budget Spent:** `₹0` (Zero paid APIs, subscriptions, databases, or third-party infrastructure)  
**Production Deployment / Database Migration:** `NOT PERFORMED` (Production SQLite & Neon test DB untouched; `vercel.json` cron `30 21 * * * UTC` preserved)

---

## 1. Executive Summary

Phase 3.9.8 implements the **10 approved and reconciled Priority 2 Batch 12 immigration, permanent residence, citizenship/naturalisation, work authorization, and family reunification pathways** at canonical queue positions **131–140** (`PRIORITY2_BATCH12_COMBINATIONS` in `src/data/priority2AuditData.ts` and the `BATCH12_398` audit dashboard tab in `src/pages/GlobalVisaCoverageAuditPage.tsx`).

All 10 pathways reuse the verified sovereign primary-source evidence records (`EVD-P393-013` through `EVD-P393-041`) and enforce the reconciled Phase 3.9.7.1 comparator mappings (including French comparator `p2-cand-fr-vpf` at Batch 11 Row `126`, Irish comparator `p2-cand-ie-stamp1g` at Batch 11 Row `127`, and Irish comparator `p2-ie-stamp4` at Batch 6 Row `80`). Across the 10 pathways, **300 profile sections** (`10 × 30`), **220 special topics** (`10 × 22`), and **900 structured claims** (`10 × 90`) have been populated, classified, scoped, and routed through the public sanitization and quarantine pipeline (`857 PUBLISHED` / `43 QUARANTINED`).

---

## 2. Reconciled Baseline Before Batch 12 (`130 / 210`)

| Metric | Reconciled Pre-Batch 12 Baseline | Verification Source |
| :--- | :--- | :--- |
| **Priority 1 Completed** | `142 / 142` (`100%`) | `src/data/priority1AuditData.ts` |
| **Priority 2 Batches 0–10 Completed** | `120 / 210` (Canonical rows `1–120`) | `src/data/priority2AuditData.ts` |
| **Priority 2 Batch 11 Completed (Reconciled)** | `10 / 210` (Canonical rows `121–130`: `p2-cand-us-n400`, `p2-cand-gb-seasonal`, `p2-cand-nz-aip`, `p2-cand-sg-dp`, `p2-cand-de-18d-research`, `p2-cand-fr-vpf`, `p2-cand-ie-stamp1g`, `p2-cand-hk-gep`, `p2-cand-jp-pr`, `p2-cand-cl-definitiva`) | `PRIORITY2_BATCH11_COMBINATIONS` & Phase 3.9.6 / 3.9.7.1 |
| **Total Priority 2 Before Batch 12** | `130 / 210` (`61.90%`) | `PRIORITY2_COMPLETED_PATHWAYS.slice(0, 130)` |
| **Synthetic Backlog Slots (`p2-queue-backlog-121..210`)** | Permanently retired in Phase 3.9.2 / 3.9.3 | Never reinstated |

---

## 3. Updated Baseline After Batch 12 (`140 / 210`)

| Metric | Updated Post-Batch 12 State | Status |
| :--- | :--- | :--- |
| **Priority 1 Completed** | `142 / 142` (`100.00%`) | Unchanged |
| **Priority 2 Completed** | `140 / 210` (`66.67%`) | **+10 Genuine Pathways (Rows 131–140)** |
| **Priority 2 Profile Sections Completed** | `4,200` (`140 × 30` sections) | **+300 Sections in Batch 12** |
| **Priority 2 Remaining Target Slots** | `70` (subject to evidence qualification: `23` reserve candidates in pool + `47` to be curated) | Preserved |
| **Combined Canonical Pathways (P1 + P2)** | `282` unique pathways (`142 P1 + 140 P2`) | Zero duplicates verified |

---

## 4. Pre-Implementation Backup Details

Before any source or registry file was modified, a complete tar.gz backup of all target source and Phase 3.9.7 input files was created and verified:

- **Backup Archive Path:** `/app/applet/backup_phase_3_9_8_batch12.tar.gz`
- **Actual Byte Size:** `92,622` bytes (`~90.45 KB`)
- **SHA-256 Checksum:** `f04701b6f2befb92060c11f2e2f666ee29727b3ce614208cf3db6173c800e88c`
- **Readability Verification (`tar -tzf`):** `PASS` (`src/data/priority2AuditData.ts`, `src/pages/GlobalVisaCoverageAuditPage.tsx`, `phase_3_9_7_proposed_batch12_candidates.json`, `phase_3_9_7_batch12_candidate_matrix.csv`, `phase_3_9_7_duplicate_and_evidence_check.csv`)

---

## 5. Summary Table of All 10 Implemented Batch 12 Pathways (Canonical Rows 131–140)

| Row | Pathway ID | Country | Official Pathway Name | Legal Instrument Type | Reused Evidence ID | Pathway Status | Published Claims | Quarantined Claims | Canonical URL |
| :---: | :--- | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **131** | `p2-cand-us-stemopt` | `US` | Optional Practical Training Extension for STEM Students (STEM OPT — 8 CFR § 214.2(f)(10)(ii)(C), Form I-765 & Form I-983) | `Work Authorization / F-1 Post-Completion OPT Extension (EAD)` | `EVD-P393-013` | `PARTIALLY_VERIFIED` | `83` | `7` | `/visa/united-states/stem-opt-extension` |
| **132** | `p2-cand-gb-hpi` | `GB` | High Potential Individual (HPI) Visa (UK Immigration Rules Appendix High Potential Individual) | `Unsponsored Post-Graduation Work Visa` | `EVD-P393-020` | `VERIFIED` | `88` | `2` | `/visa/united-kingdom/high-potential-individual-visa` |
| **133** | `p2-cand-nz-pr` | `NZ` | Permanent Resident Visa (RV2 — Immigration Act 2009 & INZ Operational Manual RV2) | `Permanent Residence Visa (Indefinite Travel Conditions)` | `EVD-P393-025` | `VERIFIED` | `88` | `2` | `/visa/new-zealand/permanent-resident-visa` |
| **134** | `p2-cand-sg-pr` | `SG` | Singapore Permanent Residence (SPR — Immigration Act 1959 & Immigration Regulations PTS / GIP / Family Scheme) | `Permanent Residence (Entry Permit, Re-Entry Permit & Blue NRIC)` | `EVD-P393-028` | `VERIFIED` | `87` | `3` | `/visa/singapore/permanent-residence-spr` |
| **135** | `p2-cand-de-citizenship` | `DE` | Entitlement to Naturalisation (`Anspruchseinbürgerung nach § 10 Staatsangehörigkeitsgesetz — StAG / StARModG`) | `Non-Visa Citizenship / Naturalisation Application (§ 10 StAG)` | `EVD-P393-030` | `PARTIALLY_VERIFIED` | `85` | `5` | `/visa/germany/naturalisation-stag-10` |
| **136** | `p2-cand-fr-citizenship` | `FR` | Naturalisation par décret (`Acquisition de la nationalité française par décret — Code civil art. 21-15 à 21-27`) | `Non-Visa Citizenship / Naturalisation by Decree (Code civil art. 21-15)` | `EVD-P393-032` | `PARTIALLY_VERIFIED` | `85` | `5` | `/visa/france/naturalisation-par-decret` |
| **137** | `p2-cand-ie-citizenship` | `IE` | Citizenship by Naturalisation (`Irish Nationality and Citizenship Act 1956 s. 15 — Residence Track`) | `Non-Visa Citizenship / Naturalisation Certificate (INCA 1956 s. 15)` | `EVD-P393-033` | `PARTIALLY_VERIFIED` | `85` | `5` | `/visa/ireland/citizenship-by-naturalisation` |
| **138** | `p2-cand-nl-pr` | `NL` | Permanent Residence Permit (`Verblijfsvergunning regulier voor onbepaalde tijd / Langdurig ingezetene EG — Vw 2000 Art. 20–21 & Art. 45a`) | `Permanent Residence Permit (Onbepaalde Tijd / EU Long-Term Resident)` | `EVD-P393-035` | `VERIFIED` | `88` | `2` | `/visa/netherlands/permanent-residence-onbepaalde-tijd` |
| **139** | `p2-cand-jp-dependent` | `JP` | Dependent Status of Residence (`在留資格「家族滞在」 — Immigration Control and Refugee Recognition Act Appended Table I-4`) | `Family / Dependent Status of Residence (家族滞在)` | `EVD-P393-036` | `PARTIALLY_VERIFIED` | `84` | `6` | `/visa/japan/dependent-visa-kazoku-taizai` |
| **140** | `p2-cand-se-partner` | `SE` | Residence Permit to Live with a Partner (`Uppehållstillstånd för att flytta till en make, maka, registrerad partner eller sambo — Utlänningslagen 5 kap. 3 § & 3 a §`) | `Family Reunification Residence Permit (Utlänningslagen Ch. 5 §§ 3–3b)` | `EVD-P393-041` | `PARTIALLY_VERIFIED` | `84` | `6` | `/visa/sweden/residence-permit-move-to-partner` |
| **Total** | **10 Pathways** | **10 Jurisdictions** | **All 10 Sovereign Authorities** | **5 Distinct Legal Instrument Classes** | **10 Reused IDs** | **4 VERIFIED / 6 PARTIALLY_VERIFIED** | **857** | **43** | **10 Canonical Routes** |

---

## 6. Legal Instrument Classification Table & Non-Visa Safeguards

In strict compliance with §4 of the Phase 3.9.8 specification, non-visa pathways are explicitly labeled with their exact legal instrument classification and never misrepresented as consular entry visas:

| Pathway ID | Sovereign Instrument Class | Statutory / Regulatory Instrument | Explicit Non-Visa / Instrument Boundary Enforced |
| :--- | :--- | :--- | :--- |
| `p2-cand-us-stemopt` | `Work Authorization / F-1 Post-Completion OPT Extension (EAD)` | `8 CFR § 214.2(f)(10)(ii)(C)`, Form I-765 `(c)(3)(C)`, Form I-983 | Onshore EAD employment authorization extension for F-1 graduates; does not issue a consular F-1 visa foil (`S21`, `S22` `NOT_APPLICABLE`). |
| `p2-cand-gb-hpi` | `Unsponsored Post-Graduation Work Visa` | UK Immigration Rules Appendix High Potential Individual (`HPI 1.1–15.2`) | Unsponsored post-graduation work permission (2 years Bachelor/Master; 3 years PhD); non-extendable (`S11` explains non-extendability). |
| `p2-cand-nz-pr` | `Permanent Residence Visa (Indefinite Travel Conditions)` | NZ Immigration Act 2009 & INZ Operational Manual `RV2` | Second-stage permanent residence visa removing 2-year Resident Visa travel conditions (`S05`, `S21` `NOT_APPLICABLE`). |
| `p2-cand-sg-pr` | `Permanent Residence (Entry Permit, Re-Entry Permit & Blue NRIC)` | Singapore Immigration Act 1959 & Immigration Regulations (`PTS` / `GIP` / Family) | Statutory Permanent Residence (Entry Permit + 5-year renewable REP + Blue NRIC); distinct from MOM work passes. |
| `p2-cand-de-citizenship` | `Non-Visa Citizenship / Naturalisation Application (§ 10 StAG)` | `§ 10 Staatsangehörigkeitsgesetz (StAG)` as reformed by `StARModG` (27 June 2024) | Sovereign nationality acquisition conferring German & EU citizenship (`Einbürgerungsurkunde`); Sections `S05`, `S11`, `S19–S22`, `S26`, `S29` marked `NOT_APPLICABLE`. |
| `p2-cand-fr-citizenship` | `Non-Visa Citizenship / Naturalisation by Decree (Code civil art. 21-15)` | French `Code civil art. 21-15 à 21-27` (`NATALI` teleprocedure) | Sovereign nationality acquisition by ministerial decree (`décret de naturalisation`); Sections `S05`, `S11`, `S19–S22`, `S26`, `S29` marked `NOT_APPLICABLE`. |
| `p2-cand-ie-citizenship` | `Non-Visa Citizenship / Naturalisation Certificate (INCA 1956 s. 15)` | Irish Nationality and Citizenship Act 1956 `s. 15` & `s. 16A` | Sovereign naturalisation certificate conferring Irish & EU citizenship (`1,825` days reckonable residence); Sections `S05`, `S11`, `S19–S22`, `S26`, `S29` marked `NOT_APPLICABLE`. |
| `p2-cand-nl-pr` | `Permanent Residence Permit (Onbepaalde Tijd / EU Long-Term Resident)` | Dutch `Vreemdelingenwet 2000 (Vw 2000)` Art. 20–21 & Art. 45a | Dual-assessed IND permanent residence (`onbepaalde tijd` & EU Long-Term Resident Directive 2003/109/EC); free labour market access (`Arbeid vrij toegestaan`). |
| `p2-cand-jp-dependent` | `Family / Dependent Status of Residence (家族滞在)` | Japanese ICRRA Appended Table I-4 (`在留資格「家族滞在」`) | Dependent status of residence for legal spouse/children; work prohibited unless separate Article 19(2) permission (`資格外活動許可`, max 28 hrs/week) is granted. |
| `p2-cand-se-partner` | `Family Reunification Residence Permit (Utlänningslagen Ch. 5 §§ 3–3b)` | Swedish `Utlänningslagen (2005:716)` Ch. 5 §§ 3, 3a, 3b & `Utsökningsbalken` Ch. 7 § 5 | Family reunification residence permit (`Uppehållstillstånd`) subject to reference-person housing and maintenance requirements (`försörjningskrav`). |

---

## 7. Reconciled Duplicate / Distinctness Confirmation Table (Including FR & IE Comparators)

In strict compliance with Phase 3.9.7.1, the comparator audit uses the canonical Batch 11 baseline (specifically `p2-cand-fr-vpf` at Row `126` and `p2-cand-ie-stamp1g` at Row `127`, alongside Batch 6 `p2-ie-stamp4` at Row `80`):

| Batch 12 Pathway | Jurisdiction | Reconciled Existing P1 & P2 Comparators Checked | Distinctness & Zero-Duplicate Verdict |
| :--- | :---: | :--- | :--- |
| `p2-cand-us-stemopt` | `US` | `p1-us-o1-stem` (P1), `p2-us-l1` (B3), `p2-us-o1` (B3), `p2-us-h1b` (B4), `p2-us-eb2niw` (B6), `p2-us-e2` (B7), `p2-cand-us-n400` (B11 Row 121) | **DISTINCT (`PASS`)** — First F-1 post-completion OPT / STEM OPT EAD work authorization pathway in VisaApply.org. |
| `p2-cand-gb-hpi` | `GB` | `p2-uk-innovator` (B1), `p2-uk-swv` (B3), `p2-uk-gtv` (B3), `p2-uk-scaleup` (B4), `p2-uk-ancestry` (B6), `p2-uk-youth` (B7), `p2-uk-family` (B8), `p2-uk-ilr` (B9), `p2-cand-gb-seasonal` (B11 Row 122) | **DISTINCT (`PASS`)** — First UK unsponsored post-graduation route under Appendix High Potential Individual. |
| `p2-cand-nz-pr` | `NZ` | `p2-nz-aewv` (B0), `p2-nz-whv` (B2), `p2-nz-smc` (B3), `p2-nz-greenlist` (B5), `p2-nz-partner` (B7), `p2-nz-parent` (B9), `p2-cand-nz-aip` (B11 Row 123) | **DISTINCT (`PASS`)** — `p2-nz-smc` & `p2-nz-greenlist` grant initial Resident Visas with 2-year travel conditions; `p2-cand-nz-pr` (`RV2`) grants indefinite travel conditions. |
| `p2-cand-sg-pr` | `SG` | `p2-sg-ep` (B1), `p2-sg-onepass` (B3), `p2-sg-techpass` (B4), `p2-sg-spass` (B6), `p2-sg-whp` (B7), `p2-sg-ltvp` (B8), `p2-sg-pep` (B9), `p2-sg-entrepass` (B10), `p2-cand-sg-dp` (B11 Row 124) | **DISTINCT (`PASS`)** — First ICA Singapore Permanent Residence (`SPR`) pathway; all 9 prior SG pathways are temporary passes. |
| `p2-cand-de-citizenship` | `DE` | `p2-de-chancenkarte` (B0), `p2-de-bluecard` (B3), `p2-de-jobseeker` (B3), `p2-de-ict` (B5), `p2-de-freelance` (B6), `p2-de-family` (B8), `p2-de-pr` (B9), `p2-de-18a-18b` (B10), `p2-cand-de-18d-research` (B11 Row 125) | **DISTINCT (`PASS`)** — `p2-de-pr` (B9) is permanent residence (`Niederlassungserlaubnis § 9 AufenthG`); `p2-cand-de-citizenship` is sovereign German naturalisation under `§ 10 StAG`. |
| `p2-cand-fr-citizenship` | `FR` | `p2-fr-tech` (B1), `p2-fr-passeport-talent` (B3), `p2-fr-entrepreneur` (B5), `p2-fr-visitor` (B6), `p2-fr-whv` (B7), `p2-fr-family` (B8), `p2-fr-resident` (B9), `p2-fr-aps-rece` (B10), **`p2-cand-fr-vpf` (B11 Row 126)** | **DISTINCT (`PASS`)** — Reconciled against Batch 11 Row 126 (`p2-cand-fr-vpf`, temporary `Vie privée et familiale` residence card) and Batch 9 (`p2-fr-resident`, 10-year `Carte de résident`). First French nationality pathway (`Code civil art. 21-15`). |
| `p2-cand-ie-citizenship` | `IE` | `p2-ie-csep` (B1), `p2-ie-gep` (B4), **`p2-ie-stamp4` (B6 Row 80)**, `p2-ie-whv` (B7), `p2-ie-joinfamily` (B8), `p2-ie-step` (B9), **`p2-cand-ie-stamp1g` (B11 Row 127)** | **DISTINCT (`PASS`)** — Reconciled against Batch 11 Row 127 (`p2-cand-ie-stamp1g`, Third Level Graduate Programme Stamp 1G) and Batch 6 Row 80 (`p2-ie-stamp4`, long-term residence permission). First Irish naturalisation pathway (`INCA 1956 s. 15`). |
| `p2-cand-nl-pr` | `NL` | `p2-nl-hsm` (B0), `p2-nl-startup` (B2), `p2-nl-orientation` (B3), `p2-nl-eu-bluecard` (B5), `p2-nl-daft` (B6), `p2-nl-whv` (B7), `p2-nl-partner` (B8) | **DISTINCT (`PASS`)** — First Dutch permanent residence (`Verblijfsvergunning regulier voor onbepaalde tijd / Langdurig ingezetene EG`) pathway; all 7 prior NL pathways are temporary residence permits. |
| `p2-cand-jp-dependent` | `JP` | `p2-jp-hsp` (B1), `p2-jp-ssw` (B3), `p2-jp-jfind` (B4), `p2-jp-digitalnomad` (B5), `p2-jp-businessmanager` (B6), `p2-jp-whv` (B7), `p2-jp-spousenational` (B8), `p2-jp-engineer` (B10), `p2-cand-jp-pr` (B11 Row 129) | **DISTINCT (`PASS`)** — `p2-jp-spousenational` (B8) covers spouses of Japanese nationals (`日本人の配偶者等`); `p2-cand-jp-dependent` (`家族滞在`) covers dependent spouses/children of foreign work/student status holders. |
| `p2-cand-se-partner` | `SE` | `p2-se-work` (B2), `p2-se-eu-bluecard` (B5), `p2-se-jobseeker` (B6), `p2-se-selfemp` (B7), `p2-se-ict` (B8), `p2-se-researcher` (B9), `p2-se-pr` (B10) | **DISTINCT (`PASS`)** — First Swedish family reunification / partner residence permit pathway under `Utlänningslagen` Ch. 5 §§ 3–3b. |

---

## 8. 30-Section Completion Matrix Summary (`300 / 300` Sections)

Every one of the 10 Batch 12 pathways has been populated across all 30 mandatory profile sections (`S01` through `S30` = `300` section entries stored in `/phase_3_9_8_batch12_section_status.csv`):

| Pathway ID | `VERIFIED` Sections | `PARTIALLY_VERIFIED` Sections | `AWAITING_VERIFICATION` Sections | `CONFLICTING` Sections | `EXPIRED` Sections | `NOT_APPLICABLE` Sections | Total Sections |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `p2-cand-us-stemopt` | `19` | `4` (`S08`, `S11`, `S14`, `S25`) | `2` (`S17`, `S18`) | `0` | `0` | `5` (`S07`, `S21`, `S22`, `S26`, `S29`) | **30** |
| `p2-cand-gb-hpi` | `26` | `2` (`S17`, `S18`) | `0` | `0` | `0` | `2` (`S05`, `S29`) | **30** |
| `p2-cand-nz-pr` | `24` | `2` (`S17`, `S18`) | `0` | `0` | `0` | `4` (`S05`, `S06`, `S07`, `S21`) | **30** |
| `p2-cand-sg-pr` | `25` | `2` (`S17`, `S18`) | `0` | `0` | `0` | `3` (`S06`, `S07`, `S21`) | **30** |
| `p2-cand-de-citizenship` | `18` | `4` (`S02`, `S08`, `S14`, `S18`) | `0` | `0` | `0` | `8` (`S05`, `S11`, `S19`, `S20`, `S21`, `S22`, `S26`, `S29`) | **30** |
| `p2-cand-fr-citizenship` | `18` | `4` (`S08`, `S14`, `S16`, `S18`) | `0` | `0` | `0` | `8` (`S05`, `S11`, `S19`, `S20`, `S21`, `S22`, `S26`, `S29`) | **30** |
| `p2-cand-ie-citizenship` | `18` | `4` (`S08`, `S14`, `S16`, `S18`) | `0` | `0` | `0` | `8` (`S05`, `S11`, `S19`, `S20`, `S21`, `S22`, `S26`, `S29`) | **30** |
| `p2-cand-nl-pr` | `23` | `2` (`S17`, `S18`) | `0` | `0` | `0` | `5` (`S05`, `S07`, `S21`, `S22`, `S29`) | **30** |
| `p2-cand-jp-dependent` | `21` | `4` (`S06`, `S08`, `S14`, `S25`) | `2` (`S17`, `S18`) | `0` | `0` | `3` (`S07`, `S26`, `S29`) | **30** |
| `p2-cand-se-partner` | `22` | `4` (`S05`, `S06`, `S08`, `S14`) | `2` (`S17`, `S18`) | `0` | `0` | `2` (`S07`, `S29`) | **30** |
| **Batch 12 Total** | **`214`** | **`32`** | **`6`** | **`0`** | **`0`** | **`48`** | **`300`** |

---

## 9. 22 Special-Topic Completion Matrix Summary (`220 / 220` Topics)

Every one of the 10 Batch 12 pathways has been evaluated across all 22 mandatory special topics (`T01` through `T22` = `220` special-topic records stored in `/phase_3_9_8_batch12_special_topics_status.csv`):

| Pathway ID | `VERIFIED` Topics | `PARTIALLY_VERIFIED` Topics | `AWAITING_VERIFICATION` Topics | `CONFLICTING` Topics | `EXPIRED` Topics | `NOT_APPLICABLE` Topics | Total Topics |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `p2-cand-us-stemopt` | `19` | `2` (`T16`, `T20`) | `0` | `0` | `0` | `1` (`T02` visa-free transit N/A for EAD) | **22** |
| `p2-cand-gb-hpi` | `21` | `0` | `0` | `0` | `0` | `1` (`T06` remote work for foreign employers not primary basis) | **22** |
| `p2-cand-nz-pr` | `21` | `0` | `0` | `0` | `0` | `1` (`T02` transit rules N/A to indefinite PR holder) | **22** |
| `p2-cand-sg-pr` | `21` | `0` | `0` | `0` | `0` | `1` (`T02` transit rules N/A to SPR holder) | **22** |
| `p2-cand-de-citizenship` | `19` | `1` (`T16`) | `0` | `0` | `0` | `2` (`T02`, `T19` overstay visa curtailment N/A after citizenship) | **22** |
| `p2-cand-fr-citizenship` | `19` | `1` (`T16`) | `0` | `0` | `0` | `2` (`T02`, `T19` overstay visa curtailment N/A after citizenship) | **22** |
| `p2-cand-ie-citizenship` | `19` | `1` (`T16`) | `0` | `0` | `0` | `2` (`T02`, `T19` overstay visa curtailment N/A after citizenship) | **22** |
| `p2-cand-nl-pr` | `21` | `0` | `0` | `0` | `0` | `1` (`T02` transit rules N/A to EU Long-Term Resident) | **22** |
| `p2-cand-jp-dependent` | `21` | `1` (`T06`) | `0` | `0` | `0` | `0` | **22** |
| `p2-cand-se-partner` | `21` | `1` (`T16`) | `0` | `0` | `0` | `0` | **22** |
| **Batch 12 Total** | **`202`** | **`7`** | **`0`** | **`0`** | **`0`** | **`11`** | **`220`** |

---

## 10. Claim Status Distribution (`900` Claims)

Across the 10 Batch 12 pathways (`300` sections × `3` structured atomic claims per section = `900` claims in `/phase_3_9_8_batch12_claim_evidence_registry.csv`):

| Verification Status | Claim Count | Percentage | Public Publication Routing |
| :--- | :---: | :---: | :--- |
| **`VERIFIED`** | `703` | `78.11%` | `PUBLISHED` (Publicly visible with official source citation & dates) |
| **`PARTIALLY_VERIFIED`** | `10` | `1.11%` | `PUBLISHED` (Only verified core statutory portion published; variable sub-details quarantined) |
| **`NOT_APPLICABLE`** | `144` | `16.00%` | `PUBLISHED` (Explicitly explains why the visa-specific section is legally inapplicable to PR/citizenship/EAD) |
| **`AWAITING_VERIFICATION`** | `39` | `4.33%` | **`QUARANTINED`** (Suppressed from public verified view) |
| **`EXPIRED`** | `4` | `0.44%` | **`QUARANTINED`** (Suppressed from public verified view: superseded historical rules) |
| **`CONFLICTING`** | `0` | `0.00%` | **`QUARANTINED`** (`0` conflicting claims in Batch 12) |
| **Total Claims Audited** | **`900`** | **`100.00%`** | **`857 PUBLISHED` (`95.22%`) / `43 QUARANTINED` (`4.78%`)** |

---

## 11. Applicability Scope Distribution (`900` Claims)

Every Batch 12 claim carries an explicit `applicability_scope` in `/phase_3_9_8_batch12_claim_evidence_registry.csv`:

| Applicability Scope | Claim Count | Description |
| :--- | :---: | :--- |
| **`RESIDENCE_SPECIFIC`** | `705` | Applies to onshore residents / status holders in the destination country (e.g., F-1 OPT holders in US, RVs in NZ, EP/S Pass holders in SG, legal residents applying for DE/FR/IE naturalisation or NL PR). |
| **`GLOBAL`** | `166` | Applies globally to eligible applicants regardless of nationality (e.g., UK HPI Ecctis top-50 global university graduates, Swedish partner applications). |
| **`NATIONALITY_GROUP`** | `21` | Applies to statutory nationality groups (e.g., EU/EEA/Swiss vs third-country rules in DE/FR/IE/NL/SE, Commonwealth/British Citizen distinctions in UK). |
| **`CONSULAR_JURISDICTION_SPECIFIC`** | `5` | Consular/local jurisdiction rules (e.g., Japanese embassies/consulates for COE visa issuance, French prefecture/consular `NATALI` jurisdiction, German local `Einbürgerungsbehörde`, Swedish embassy interview posts). |
| **`NATIONALITY_SPECIFIC`** | `3` | Bilateral nationality-specific rules (e.g., Irish citizenship rules for UK/EEA vs non-EEA residence proof, French Francophone country exemptions, Japanese visa-waiver vs non-waiver nationals). |
| **`UNKNOWN`** | `0` | Zero `UNKNOWN` scope claims in Batch 12 (any `UNKNOWN` scope is automatically quarantined by architecture). |
| **Total** | **`900`** | **100% Scoped** |

---

## 12. Quarantine Register Summary (`43` Quarantined Claims)

All `43` quarantined claims (`39 AWAITING_VERIFICATION` + `4 EXPIRED`) are recorded in `/phase_3_9_8_batch12_quarantine_register.csv` and suppressed from public verified rendering:

| Pathway ID | Quarantined Count | Quarantined Claim IDs | Specific Quarantine Reason & Resolution Requirement |
| :--- | :---: | :--- | :--- |
| `p2-cand-us-stemopt` | **7** | `CLM-US-B12-S11-3` (`EXPIRED`), `CLM-US-B12-S17-1..3` (`AWAITING_VERIFICATION`), `CLM-US-B12-S18-1..3` (`AWAITING_VERIFICATION`) | `S11-3` is the superseded pre-May 2016 17-month STEM OPT rule (`EXPIRED`); `S17-1..3` (Form I-765 paper/online/Form I-907 fees) are quarantined because `uscis.gov/g-1055` returned WAF HTTP 403; `S18-1..3` (USCIS service-center processing times) are dynamic. |
| `p2-cand-gb-hpi` | **2** | `CLM-GB-B12-S17-3`, `CLM-GB-B12-S18-3` (`AWAITING_VERIFICATION`) | Base £822 fee, £1,035/yr IHS, and £210/£258 Ecctis fee (`S17-1`, `S17-2`) and 3-week overseas / 8-week UK standard timelines (`S18-1`, `S18-2`) are `VERIFIED`; only optional priority/VAC local surcharges (`S17-3`) and peak-season biometric wait variance (`S18-3`) are quarantined. |
| `p2-cand-nz-pr` | **2** | `CLM-NZ-B12-S17-3`, `CLM-NZ-B12-S18-3` (`AWAITING_VERIFICATION`) | INZ RV2 statutory eligibility is `VERIFIED`; only nationality-band fee/levy sub-variations (`S17-3`) and dynamic INZ live queue percentiles (`S18-3`) are quarantined. |
| `p2-cand-sg-pr` | **3** | `CLM-SG-B12-S08-3`, `CLM-SG-B12-S17-3`, `CLM-SG-B12-S18-3` (`AWAITING_VERIFICATION`) | S$100 application fee, S$20 Entry Permit, S$50 5-year REP, S$50 NRIC (`S17-1`, `S17-2`) and general ~6-month ICA guidance (`S18-1`, `S18-2`) are `VERIFIED`; only non-public ICA holistic assessment weights (`S08-3`), NS liability edge cases (`S17-3`), and complex dossier review variance (`S18-3`) are quarantined. |
| `p2-cand-de-citizenship` | **5** | `CLM-DE-B12-S02-3` (`EXPIRED`), `CLM-DE-B12-S08-3`, `CLM-DE-B12-S14-3`, `CLM-DE-B12-S18-2`, `CLM-DE-B12-S18-3` (`AWAITING_VERIFICATION`) | `S02-3` is the superseded pre-27 June 2024 8-year residence and mandatory renunciation rule (`EXPIRED`); federal €255 adult / €51 minor fees (`S17-1..3`) are `VERIFIED`; municipal processing queues across 400+ local `Einbürgerungsbehörden` (`S08-3`, `S14-3`, `S18-2`, `S18-3`) are quarantined. |
| `p2-cand-fr-citizenship` | **5** | `CLM-FR-B12-S16-3` (`EXPIRED`), `CLM-FR-B12-S08-3`, `CLM-FR-B12-S14-3`, `CLM-FR-B12-S18-2`, `CLM-FR-B12-S18-3` (`AWAITING_VERIFICATION`) | `S16-3` is the superseded paper Cerfa n°12753*02 prefecture filing procedure (`EXPIRED`, replaced by `NATALI`); €55 electronic fiscal stamp (`S17-1..3`) and 18-month/12-month statutory response deadlines (`S18-1`) are `VERIFIED`; prefecture-level interview wait times (`S08-3`, `S14-3`, `S18-2`, `S18-3`) are quarantined. |
| `p2-cand-ie-citizenship` | **5** | `CLM-IE-B12-S16-3` (`EXPIRED`), `CLM-IE-B12-S08-3`, `CLM-IE-B12-S14-3`, `CLM-IE-B12-S18-2`, `CLM-IE-B12-S18-3` (`AWAITING_VERIFICATION`) | `S16-3` is the superseded paper Form 8 postal workflow (`EXPIRED`, replaced by ISD Digital Portal); €175 application fee and €950 adult / €200 minor/widow certification fees (`S17-1..3`) are `VERIFIED`; live ISD eVetting and ceremony scheduling queues (`S08-3`, `S14-3`, `S18-2`, `S18-3`) are quarantined. |
| `p2-cand-nl-pr` | **2** | `CLM-NL-B12-S17-3`, `CLM-NL-B12-S18-3` (`AWAITING_VERIFICATION`) | IND 6-month statutory decision period (`S18-1`, `S18-2`) and statutory fee framework (`S17-1`, `S17-2`) are `VERIFIED`; annual January/July IND fee indexation (`S17-3`) and complex revocation checks (`S18-3`) are quarantined. |
| `p2-cand-jp-dependent` | **6** | `CLM-JP-B12-S17-1..3`, `CLM-JP-B12-S18-1..3` (`AWAITING_VERIFICATION`) | ISA Dependent (`家族滞在`) eligibility, documents, and 28 hr/week `資格外活動許可` rules are `VERIFIED`; April 2025/2026 online vs counter revenue-stamp fee schedule (`S17-1..3`) and regional bureau quarterly processing averages (`S18-1..3`) are quarantined. |
| `p2-cand-se-partner` | **6** | `CLM-SE-B12-S06-3`, `CLM-SE-B12-S17-2`, `CLM-SE-B12-S17-3`, `CLM-SE-B12-S18-1..3` (`AWAITING_VERIFICATION`) | `Utlänningslagen` Ch. 5 §§ 3–3b eligibility and SEK 2,000 adult / SEK 1,000 child fee (`S17-1`) are `VERIFIED`; annual `prisbasbelopp` normalbelopp indexation (`S06-3`), exemption sub-cases (`S17-2`, `S17-3`), and dynamic Migrationsverket embassy interview queues (`S18-1..3`) are quarantined. |

---

## 13. Source & Evidence Registry Summary (`EVD-P393-013` .. `EVD-P393-041`)

All 10 Batch 12 pathways reuse the verified Phase 3.9.3 / 3.9.7 primary official sources recorded in `/phase_3_9_8_batch12_source_registry.csv`:

| Evidence ID | Pathway ID | Issuing Authority | Primary Official Source URL | Secondary Official Source URL | HTTP / Verification |
| :---: | :--- | :--- | :--- | :--- | :---: |
| `EVD-P393-013` | `p2-cand-us-stemopt` | USCIS & ICE SEVP | `https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt` | `https://www.uscis.gov/i-765` | `HTTP 200` (2026-11-13) |
| `EVD-P393-020` | `p2-cand-gb-hpi` | UKVI (Home Office) | `https://www.gov.uk/high-potential-individual-visa` | `https://www.gov.uk/high-potential-individual-visa/eligibility` | `HTTP 200` (2026-11-13) |
| `EVD-P393-025` | `p2-cand-nz-pr` | Immigration New Zealand (INZ) | `https://www.immigration.govt.nz/visas/permanent-resident-visa/` | `https://www.immigration.govt.nz/new-zealand-visas/already-have-a-visa/becoming-a-permanent-resident/permanent-resident-visa` | `HTTP 200` (2026-11-13) |
| `EVD-P393-028` | `p2-cand-sg-pr` | ICA Singapore | `https://www.ica.gov.sg/information-and-e-services/citizenship-and-permanent-residence/permanent-residence/permanent-residence-application` | `https://www.ica.gov.sg/reside/PR/apply` | `HTTP 200` (2026-11-13) |
| `EVD-P393-030` | `p2-cand-de-citizenship` | BMJV / BMI / BVA | `https://www.gesetze-im-internet.de/stag/__10.html` | `https://www.einbuergerung.de/` | `HTTP 200` (2026-11-13) |
| `EVD-P393-032` | `p2-cand-fr-citizenship` | Ministère de l'Intérieur (DGEF / SDANF) | `https://www.service-public.gouv.fr/particuliers/vosdroits/F2213` | `https://administration-etrangers-en-france.interieur.gouv.fr/` | `HTTP 200` (2026-11-13) |
| `EVD-P393-033` | `p2-cand-ie-citizenship` | Department of Justice (ISD Ireland) | `https://www.irishimmigration.ie/how-to-become-an-irish-citizen-guide/` | `https://www.citizensinformation.ie/en/moving-country/irish-citizenship/becoming-an-irish-citizen-through-naturalisation/` | `HTTP 200` (2026-11-13) |
| `EVD-P393-035` | `p2-cand-nl-pr` | IND Netherlands | `https://ind.nl/en/extend-renew-and-change/permanent-residency/permanent-residence-permit` | `https://ind.nl/en/fees-costs-of-an-application` | `HTTP 200` (2026-11-13) |
| `EVD-P393-036` | `p2-cand-jp-dependent` | ISA Japan (MOJ) | `https://www.moj.go.jp/isa/applications/status/dependent.html` | `https://www.moj.go.jp/isa/applications/procedures/16-2.html` | `HTTP 200` (2026-11-13) |
| `EVD-P393-041` | `p2-cand-se-partner` | Migrationsverket (Swedish Migration Agency) | `https://www.migrationsverket.se/en/you-want-to-apply/live-with-someone/live-with-a-partner-child-or-other-relative/live-with-a-partner.html` | `https://www.migrationsverket.se/en/you-want-to-apply/live-with-someone/live-with-a-partner-child-or-other-relative/live-with-a-partner/maintenance-requirement-for-the-person-in-sweden.html` | `HTTP 200` (2026-11-13) |

---

## 14. Public Sanitization Test Results (`/phase_3_9_8_public_sanitization_test.json`)

Programmatic verification of `getPublicPriority2PathwayView(id)` and claim-level public filtering across all 10 Batch 12 pathways confirmed:

- **`overall_status`:** `PASS`
- **`internal_corrective_notes_stripped_from_public_view`:** `true` (`correctiveClassificationNotes` stripped from all 10 public pathway views)
- **`reviewer_notes_and_quarantine_reason_stripped_from_public_claims`:** `true` (`0` internal fields leaked)
- **`awaiting_verification_claims_quarantined`:** `true` (all `39 AWAITING_VERIFICATION` claims suppressed from public verified output)
- **`expired_claims_quarantined`:** `true` (all `4 EXPIRED` claims suppressed from public verified output)
- **`conflicting_claims_quarantined`:** `true` (`0 CONFLICTING` claims)
- **`unknown_scope_claims_quarantined`:** `true` (`0 UNKNOWN` scope claims)
- **`public_published_claims`:** `857` / `900` (`43` quarantined claims suppressed; `0` leaked)

---

## 15. Build, TypeScript, Duplicate & Regression Verification Results

| Verification Check | Tool / Method | Result | Details |
| :--- | :--- | :---: | :--- |
| **Application Build** | `compile_applet` (`npm run build`) | **`PASS`** | Clean production bundle compilation |
| **TypeScript & Lint Check** | `lint_applet` (`npm run lint`) | **`PASS`** | Zero TypeScript or ESLint errors |
| **Duplicate Pathway ID Check** | `npx tsx` programmatic check across P1 (`142`) + P2 (`140`) | **`PASS`** | `282 / 282` unique canonical IDs (`0` duplicates) |
| **Duplicate Claim ID Check** | `npx tsx` programmatic check across Batch 12 (`900` claims) | **`PASS`** | `900 / 900` unique claim IDs (`0` duplicates) |
| **Historical Regression Check** | Programmatic verification of P1 (`142`) & P2 Batches 0–11 (`130`) | **`PASS`** | All `142` P1 and `130` P2 Batches 0–11 pathways untouched |
| **Cron & Database Preservation** | `vercel.json` & filesystem check | **`PASS`** | Cron `30 21 * * * UTC` preserved; SQLite & Neon DB untouched |

---

## 16. Files Created or Modified, Byte Sizes, and SHA-256 Checksums

| File Path | Action | Byte Size | SHA-256 Checksum |
| :--- | :---: | ---: | :--- |
| `/backup_phase_3_9_8_batch12.tar.gz` | Created (Pre-Change Backup) | `92,622` | `f04701b6f2befb92060c11f2e2f666ee29727b3ce614208cf3db6173c800e88c` |
| `/src/data/priority2AuditData.ts` | Updated (Added Batch 12 rows 131–140 & summary metrics) | `247,147` | `1613c057673cf638b723bd108d26fd8b0271ada7b7a2e366a27b7d5eee2b9ef8` |
| `/src/pages/GlobalVisaCoverageAuditPage.tsx` | Updated (Added `BATCH12_398` tab & Batch 12 test suite) | `137,869` | `850e789e0427b5623823eb30d7b9a50d39c2b9506ca5ea8330cd29ff8e235839` |
| `/phase_3_9_8_batch12_pathway_manifest.json` | Created (10 pathways, 300 sections, 220 topics, 900 claims) | `194,684` | `4c35529c29181961c92bf8269465a95fd0760a7cc09c6d76496b45ca7dc6f20d` |
| `/phase_3_9_8_batch12_claim_evidence_registry.csv` | Created (900 structured claims with evidence & scope) | `904,286` | `bf4cdba2a7559afe1648cbe444c9dfa9d5ccf2b6d30910ce9955413b8ba67fbb` |
| `/phase_3_9_8_batch12_section_status.csv` | Created (300 profile section status records) | `57,314` | `dd127d10a3090b1830b9b6f0a5b455ad1b663be6905b8e5d86ab5006676b9587` |
| `/phase_3_9_8_batch12_special_topics_status.csv` | Created (220 special-topic status records) | `119,187` | `70a94b30b7dfa52bbc1813a215f1da5ded96260e5ab1ce7ab9df105d39189ad3` |
| `/phase_3_9_8_batch12_quarantine_register.csv` | Created (43 quarantined claim records) | `20,275` | `67f35d4dd21cbdfffbbe8f79dc6abad9005eca0b0454ad6e2040642ab7fa9c78` |
| `/phase_3_9_8_batch12_source_registry.csv` | Created (10 official sovereign source pairs) | `3,662` | `4dc39f28e2fc146aeabe7857e6bd39d0614085dcc3a4bc842324e6cbcf4d87b8` |
| `/phase_3_9_8_public_sanitization_test.json` | Created (Public sanitization & regression verification output) | `8,353` | `2be6d1bf0fc8a6d04bc20e1c6dc99331f8aefd0822d58cf52022d130f371a763` |
| `/phase_3_9_8_change_manifest.json` | Created (Full file inventory, checksums & baseline state) | `2,944` | Verified on disk |

---

## 17. Exact Rollback Command

If an immediate rollback to the pre-Phase 3.9.8 state (`130 / 210` Priority 2 pathways) is ever required, run from `/app/applet`:

```bash
tar -xzf /app/applet/backup_phase_3_9_8_batch12.tar.gz -C /app/applet && rm -f /app/applet/phase_3_9_8_batch12_pathway_manifest.json /app/applet/phase_3_9_8_batch12_claim_evidence_registry.csv /app/applet/phase_3_9_8_batch12_section_status.csv /app/applet/phase_3_9_8_batch12_special_topics_status.csv /app/applet/phase_3_9_8_batch12_quarantine_register.csv /app/applet/phase_3_9_8_batch12_source_registry.csv /app/applet/phase_3_9_8_public_sanitization_test.json /app/applet/phase_3_9_8_change_manifest.json /app/applet/phase_3_9_8_batch12_implementation_report.md
```

---

## 18. Remaining Priority 2 Roadmap Note (`70` Remaining Target Slots)

With Batch 12 implemented (`140 / 210` complete), **70 target slots** remain in the Priority 2 coverage roadmap:
- **23 pre-vetted reserve candidates** remain in the Phase 3.9.3 / 3.9.7 official-source candidate pool for Batches 13–15.
- **47 additional genuine pathways** will be curated from primary sovereign immigration sources in future curation phases.
- All 90 historical synthetic placeholders (`p2-queue-backlog-121..210`) remain permanently retired.

---

## 19. Mandatory Completion Summary

PHASE 3.9.8: COMPLETE

Batch 12 pathways implemented: 10 / 10
Batch 12 pathways validated: 10 / 10
Priority 1 completed: 142 / 142
Priority 2 completed before Batch 12: 130 / 210
Priority 2 completed after Batch 12: 140 / 210
Remaining Priority 2 target: 70
Profile sections populated: 300 / 300
Special topics populated: 220 / 220
Claims created/mapped: 900
VERIFIED claims: 703
PARTIALLY_VERIFIED claims: 10
AWAITING_VERIFICATION claims: 39
CONFLICTING claims: 0
EXPIRED claims: 4
NOT_APPLICABLE claims: 144
Public-eligible claims: 857
Quarantined claims: 43
Public sanitization test: PASS
Build: PASS
TypeScript: PASS
Duplicate check: PASS
Regression check: PASS
Production deployment: NOT PERFORMED
Production database migration: NOT PERFORMED
Additional cost: ₹0

Next phase: Phase 3.9.9 — Batch 12 Post-Implementation Audit.
