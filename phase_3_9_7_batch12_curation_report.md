# VISAAPPLY.ORG — PHASE 3.9.7
## PRIORITY 2 — BATCH 12 AUTHORITATIVE CANDIDATE CURATION REPORT

**Date (UTC):** 2026-11-13  
**Phase:** 3.9.7 — Priority 2 Batch 12 Authoritative Candidate Curation & Preflight  
**Additional Spend:** ₹0 (zero paid APIs, zero external subscriptions, zero database migrations, zero production deployments)  

---

## 1. Confirmed Completed Priority 2 Baseline

| Metric | Confirmed Value | Source of Truth |
|---|---|---|
| **Priority 1 Completed Pathways** | `142 / 142` | `PRIORITY1_AUDIT_PATHWAYS` (`src/data/priority1AuditData.ts`) |
| **Priority 2 Completed Pathways (Batches 0–10)** | `120 / 210` | `PRIORITY2_COMPLETED_PATHWAYS` (`src/data/priority2AuditData.ts`, rows `1..120`) |
| **Priority 2 Completed Pathways (Batch 11 — Phase 3.9.5 & 3.9.6)** | `10 / 210` | `PRIORITY2_COMPLETED_PATHWAYS` (`src/data/priority2AuditData.ts`, rows `121..130`) |
| **Cumulative Completed Priority 2 Baseline** | **`130 / 210`** | Verified in `src/data/priority2AuditData.ts` & Phase 3.9.6 Post-Implementation Audit |
| **Batch 12 Implementation Status** | **`NOT STARTED`** | Staged in preflight artifacts only (`phase_3_9_7_proposed_batch12_candidates.json`) |
| **Remaining Original Priority 2 Target Slots** | **`80` slots** (`131..210`) | Subject to genuine evidence qualification (`33` verified genuine candidates currently qualified) |

---

## 2. Exact Number of Candidate Pathways Examined, Accepted, and Rejected

Out of the `159` total records tracked in `phase_3_9_3_candidate_registry.csv`:
- **`90` synthetic backlog slots (`p2-queue-backlog-121..210`):** Permanently rejected in Phase 3.9.2 / 3.9.3 (`REJECTED_FABRICATED_OR_UNSUPPORTED`). Not reused or resurrected.
- **`69` real immigration/residence/work/family/citizenship pathway probes examined across official government portals:**
  - **`10` Already Implemented in Batch 11 (`ALREADY_IMPLEMENTED_IN_BATCH_11`):** `p2-cand-us-n400`, `p2-cand-ca-pr-express`, `p2-cand-ca-citizenship`, `p2-cand-au-citizenship`, `p2-cand-fr-resident10`, `p2-cand-es-longterm`, `p2-cand-it-perm-ue`, `p2-cand-ie-stamp4`, `p2-cand-pt-pr`, `p2-cand-jp-pr`.
  - **`59` Remaining Real Candidate Probes Evaluated for Batch 12 (`phase_3_9_7_duplicate_and_evidence_check.csv`):**
    - **`33` Accepted as Genuine Qualified Candidates (`VERIFIED`, HTTP 200 direct non-homepage government/statutory URL):**
      - **`10` Selected & Staged for Batch 12 (`SELECTED_FOR_BATCH_12`):** `4 APPROVAL_READY` + `6 APPROVAL_READY_WITH_DISCLOSED_GAPS`.
      - **`23` Retained in Verified Reserve Pool (`QUALIFIED_RESERVE_POOL_BATCH_13_PLUS`):** Verified HTTP 200 genuine routes reserved for Batches 13–15.
    - **`26` Rejected or Held (`NOT_READY` / `REJECTED`):**
      - **`2` Rejected as Duplicates (`REJECTED_DUPLICATE`):**
        1. `dup-cand-es-nomad` (Spain Digital Nomad Visa — Ley 28/2022) $\rightarrow$ duplicates completed Batch 1 `p2-es-digitalnomad`.
        2. `dup-cand-de-settlement` (Germany Settlement Permit — `§ 9 AufenthG`) $\rightarrow$ duplicates completed Batch 10 `p2-de-settle`.
      - **`3` Quarantined / Rejected as Expired / Closed Routes (`QUARANTINE_EXPIRED`):**
        1. `p2-cand-gb-tier1-investor` (UK Tier 1 Investor Visa — closed 17 Feb 2022).
        2. `p2-cand-gb-startup` (UK Start-up Visa — closed to new applications 13 Jul 2023).
        3. `p2-cand-pt-golden-realestate` (Portugal ARI Real Estate Sub-route — abolished by Lei n.º 56/2023).
      - **`1` Quarantined / Held due to Active Legal/Designation Conflict (`QUARANTINE_CONFLICT`):**
        1. `p2-cand-us-tps` (USCIS Form I-821 Temporary Protected Status — active federal litigation and country-specific Federal Register termination/extension conflicts).
      - **`10` Held as `NOT_READY` due to Client-Side SPA Hydration Shell or Upstream Timeout (`HOLD_PARTIAL` / `PARTIALLY_VERIFIED`):**
        - `p2-cand-ca-spousal`, `p2-cand-ca-supervisa`, `p2-cand-ca-iec`, `p2-cand-au-820`, `p2-cand-au-143`, `p2-cand-au-482`, `p2-cand-au-858`, `p2-cand-nz-citizenship`, `p2-cand-fi-family`, `p2-cand-hk-pr`.
      - **`10` Held as `NOT_READY` due to Government WAF HTTP 403 or Restructured Portal HTTP 404 (`HOLD_WAF_OR_404` / `AWAITING_VERIFICATION`):**
        - `p2-cand-pt-citizenship`, `p2-cand-ae-golden`, `p2-cand-ae-green`, `p2-cand-ae-remote`, `p2-cand-kr-f2-7`, `p2-cand-kr-f5`, `p2-cand-kr-f6`, `p2-cand-my-mm2h`, `p2-cand-th-ltr`, `p2-cand-br-nomad`.

---

## 3. Proposed Batch 12 Candidate List (10 Genuine Pathways Across 10 Countries)

| Rank | Candidate ID | Country | Official Pathway Name | Instrument Category | Scope | Verification Status | Readiness Decision |
|---|---|---|---|---|---|---|---|
| 1 | `p2-cand-us-stemopt` | United States (`US`) | Optional Practical Training Extension for STEM Students (STEM OPT) | Work authorization | `RESIDENCE_SPECIFIC` | `VERIFIED` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` |
| 2 | `p2-cand-gb-hpi` | United Kingdom (`GB`) | High Potential Individual (HPI) Visa | Visa | `GLOBAL` | `VERIFIED` | `APPROVAL_READY` |
| 3 | `p2-cand-nz-pr` | New Zealand (`NZ`) | Permanent Resident Visa | Permanent residence | `RESIDENCE_SPECIFIC` | `VERIFIED` | `APPROVAL_READY` |
| 4 | `p2-cand-sg-pr` | Singapore (`SG`) | Singapore Permanent Residence (SPR) Application | Permanent residence | `RESIDENCE_SPECIFIC` | `VERIFIED` | `APPROVAL_READY` |
| 5 | `p2-cand-de-citizenship` | Germany (`DE`) | Entitlement to Naturalisation (`Anspruchseinbürgerung § 10 StAG`) | Citizenship / naturalization | `RESIDENCE_SPECIFIC` | `VERIFIED` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` |
| 6 | `p2-cand-fr-citizenship` | France (`FR`) | French Naturalisation by Decree (`Naturalisation par décret`) | Citizenship / naturalization | `RESIDENCE_SPECIFIC` | `VERIFIED` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` |
| 7 | `p2-cand-ie-citizenship` | Ireland (`IE`) | Irish Citizenship by Naturalisation | Citizenship / naturalization | `RESIDENCE_SPECIFIC` | `VERIFIED` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` |
| 8 | `p2-cand-nl-pr` | Netherlands (`NL`) | Permanent Residence Permit (`Verblijfsvergunning regulier voor onbepaalde tijd`) | Permanent residence | `RESIDENCE_SPECIFIC` | `VERIFIED` | `APPROVAL_READY` |
| 9 | `p2-cand-jp-dependent` | Japan (`JP`) | Dependent Status of Residence (`家族滞在`) | Family / dependent route | `RESIDENCE_SPECIFIC` | `VERIFIED` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` |
| 10 | `p2-cand-se-partner` | Sweden (`SE`) | Residence Permit to Live with a Partner in Sweden | Family / dependent route | `GLOBAL` | `VERIFIED` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` |

---

## 4. Country and Legal Instrument Classification for Each Candidate

1. **`p2-cand-us-stemopt` (`US` — United States):**
   - **Instrument Category:** Work authorization (Post-Study Employment Authorization Document [EAD] extension, Form I-765 category `(c)(3)(C)` & Form I-983 Training Plan).
   - **Statutory / Regulatory Basis:** `8 CFR § 214.2(f)(10)(ii)(C)`; `8 CFR § 274a.12(b)(6)(iv)`.
   - **Classification Note:** Explicitly classified as an onshore F-1 post-completion work authorization extension (`Work authorization`), NOT a consular visa stamp.
2. **`p2-cand-gb-hpi` (`GB` — United Kingdom):**
   - **Instrument Category:** Visa (Unsponsored Post-Graduation Work Visa / Entry Clearance & Permission to Stay).
   - **Statutory / Regulatory Basis:** UK Immigration Rules, `Appendix High Potential Individual` (`HPI 1.1` to `HPI 15.2`).
3. **`p2-cand-nz-pr` (`NZ` — New Zealand):**
   - **Instrument Category:** Permanent residence (Second-stage Permanent Resident Visa granting indefinite travel conditions).
   - **Statutory / Regulatory Basis:** `Immigration Act 2009 s. 73`; INZ Operational Manual `RV2` (Permanent Resident Visas).
4. **`p2-cand-sg-pr` (`SG` — Singapore):**
   - **Instrument Category:** Permanent residence (Entry Permit & Re-Entry Permit / Blue NRIC under PTS & Family Schemes).
   - **Statutory / Regulatory Basis:** `Immigration Act 1959 (2020 Revised Edition) s. 10 & s. 11`; Immigration Regulations.
5. **`p2-cand-de-citizenship` (`DE` — Germany):**
   - **Instrument Category:** Citizenship / naturalization (Non-visa statutory entitlement to German naturalisation — `Anspruchseinbürgerung`).
   - **Statutory / Regulatory Basis:** `Staatsangehörigkeitsgesetz (StAG) § 10` & `§ 38` (as amended by `StARModG`).
6. **`p2-cand-fr-citizenship` (`FR` — France):**
   - **Instrument Category:** Citizenship / naturalization (Non-visa sovereign acquisition of French nationality by ministerial decree — `Naturalisation par décret`).
   - **Statutory / Regulatory Basis:** `Code civil articles 21-15 à 21-27`; `Décret n° 93-1362 du 30 décembre 1993`.
7. **`p2-cand-ie-citizenship` (`IE` — Ireland):**
   - **Instrument Category:** Citizenship / naturalization (Non-visa Certificate of Naturalisation).
   - **Statutory / Regulatory Basis:** `Irish Nationality and Citizenship Act 1956 (as amended), s. 15 & s. 15A`.
8. **`p2-cand-nl-pr` (`NL` — Netherlands):**
   - **Instrument Category:** Permanent residence (`Verblijfsvergunning regulier voor onbepaalde tijd` & EU Long-Term Resident Permit).
   - **Statutory / Regulatory Basis:** `Vreemdelingenwet 2000 (Vw 2000) art. 20–21, 45a–45h`; Council Directive `2003/109/EC`.
9. **`p2-cand-jp-dependent` (`JP` — Japan):**
   - **Instrument Category:** Family / dependent route (Derivative Status of Residence `家族滞在` / Certificate of Eligibility & Permission to Change/Extend Period of Stay).
   - **Statutory / Regulatory Basis:** `Immigration Control and Refugee Recognition Act (ICRRA, Cabinet Order No. 319 of 1951), Appended Table I-4 (Dependent / 家族滞在)`.
10. **`p2-cand-se-partner` (`SE` — Sweden):**
    - **Instrument Category:** Family / dependent route (Family Reunification Residence Permit to live with a spouse, registered partner, or cohabiting partner `sambo`).
    - **Statutory / Regulatory Basis:** `Utlänningslagen (2005:716) Chapter 5, §§ 3, 3a, 3b`.

---

## 5. Official Evidence Links, HTTP Statuses, Verbatim Titles, and Supporting Excerpts

| Rank | Candidate ID | Administering Authority | Direct Official URL (Non-Homepage) | HTTP | Content-Type | Checked (UTC) | Verbatim Page Title | Supporting Excerpt |
|---|---|---|---|---|---|---|---|---|
| 1 | `p2-cand-us-stemopt` | U.S. Citizenship and Immigration Services (USCIS) | `https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt` | `200` | `text/html` | `2026-11-13` | `Optional Practical Training Extension for STEM Students (STEM OPT) \| USCIS` | *"Certain F-1 students who receive science, technology, engineering, and math (STEM) degrees may apply for a 24-month extension of their post-completion optional practical training (OPT)."* |
| 2 | `p2-cand-gb-hpi` | UK Visas and Immigration (UKVI) — GOV.UK | `https://www.gov.uk/high-potential-individual-visa` | `200` | `text/html` | `2026-11-13` | `High Potential Individual (HPI) visa: Overview - GOV.UK` | *"A High Potential Individual (HPI) visa gives you permission to stay in the UK for at least 2 years. To apply, you must have been awarded a qualification by an eligible university in the last 5 years."* |
| 3 | `p2-cand-nz-pr` | Immigration New Zealand (INZ) | `https://www.immigration.govt.nz/visas/permanent-resident-visa/` | `200` | `text/html` | `2026-11-13` | `Permanent Resident Visa :: Immigration New Zealand` | *"If you have held a resident visa for more than 2 years, you can apply for a Permanent Resident Visa. This visa allows you to live in New Zealand permanently, and travel in and out of New Zealand without restriction. Cost from NZD $315; 80% processed within 3 weeks."* |
| 4 | `p2-cand-sg-pr` | Immigration & Checkpoints Authority (ICA) Singapore | `https://www.ica.gov.sg/information-and-e-services/citizenship-and-permanent-residence/permanent-residence/permanent-residence-application` | `200` | `text/html` | `2026-11-13` | `ICA \| Permanent Residence Application` | *"As a Permanent Resident (PR), you will be issued a Blue National Registration Identity Card (NRIC), which serves as your identity document in Singapore. Eligible categories include Spouse of a SC/PR, Unmarried child under 21, Aged parent of a SC, Employment Pass or S Pass holder, Student studying in Singapore, and Foreign investor."* |
| 5 | `p2-cand-de-citizenship` | Bundesministerium der Justiz / Bundesamt für Justiz (`gesetze-im-internet.de`) | `https://www.gesetze-im-internet.de/stag/__10.html` | `200` | `text/html` | `2026-11-13` | `§ 10 StAG - Einzelnorm` | *"Ein Ausländer, der seit fünf Jahren rechtmäßig seinen gewöhnlichen Aufenthalt im Inland hat und handlungsfähig nach § 37 Absatz 1 Satz 1 oder gesetzlich vertreten ist, ist auf Antrag einzubürgern, wenn seine Identität und Staatsangehörigkeit geklärt sind..."* |
| 6 | `p2-cand-fr-citizenship` | Direction de l'information légale et administrative (`Service-Public.fr`) | `https://www.service-public.gouv.fr/particuliers/vosdroits/F2213` | `200` | `text/html` | `2026-11-13` | `Naturalisation française par décret \| Service-Public.fr` | *"La naturalisation par décret est l'un des modes d'acquisition de la nationalité française. À la différence de la déclaration de nationalité (par mariage, par exemple), ce n'est pas un droit automatique. Vous devez remplir des conditions liées à la régularité de votre séjour en France, à votre intégration dans la société française..."* |
| 7 | `p2-cand-ie-citizenship` | Department of Justice — Immigration Service Delivery (`irishimmigration.ie`) | `https://www.irishimmigration.ie/how-to-become-an-irish-citizen-guide/` | `200` | `text/html` | `2026-11-13` | `How to become an Irish citizen - Immigration Service Delivery` | *"Citizenship by naturalisation: If you have lived in Ireland as a legal resident for a specific period of time (reckonable residence), you can apply to become an Irish citizen by naturalisation. Generally, you must have 5 years (1825 or 1826 days) of reckonable residence in the last 9 years, including 1 year of continuous residence immediately before your application."* |
| 8 | `p2-cand-nl-pr` | Immigratie- en Naturalisatiedienst (`IND.nl`) | `https://ind.nl/en/extend-renew-and-change/permanent-residency/permanent-residence-permit` | `200` | `text/html` | `2026-11-13` | `Permanent residence permit \| IND` | *"Have you had a residence permit in the Netherlands for 5 years or more? Then you can apply for a permanent residence permit. You must have had a valid Dutch residence permit for 5 consecutive years immediately before you apply, have sufficient and sustainable income, and hold the civic integration diploma. Cost: € 254."* |
| 9 | `p2-cand-jp-dependent` | Immigration Services Agency of Japan (`MOJ ISA`) | `https://www.moj.go.jp/isa/applications/status/dependent.html` | `200` | `text/html` | `2026-11-13` | `在留資格「家族滞在」 \| 出入国在留管理庁` | *"在留資格「家族滞在」：教授、芸術、宗教、報道、高度専門職、経営・管理、法律・会計業務、医療、研究、教育、技術・人文知識・国際業務、企業内転勤、介護、興行、技能、特定技能２号、文化活動、留学の在留資格をもって在留する者の扶養を受ける配偶者又は子として行う日常的な活動。在留期間：５年、４年３月、４年、３年３月、３年、２年３月、２年、１年３月、１年、６月又は３月。"* |
| 10 | `p2-cand-se-partner` | Swedish Migration Agency (`Migrationsverket`) | `https://www.migrationsverket.se/en/you-want-to-apply/live-with-someone/live-with-a-partner-child-or-other-relative/live-with-a-partner.html` | `200` | `text/html` | `2026-11-13` | `Live with a partner – Swedish Migration Agency` | *"If you are a citizen of a country outside the EU and want to move to a family member in Sweden, you need a residence permit. You can get a residence permit if you are married, have entered into a partnership, or have been cohabiting, or if you are planning to get married or cohabit with someone who lives in Sweden."* |

---

## 6. Verification Status and Scope Classification

All 10 Batch 12 candidates hold candidate-level verification status `VERIFIED` based on live HTTP 200 captures from official government/statutory domains:
- **`GLOBAL` (`2` pathways):**
  - `p2-cand-gb-hpi` (UK High Potential Individual Visa — open globally to graduates of eligible top non-UK universities applying from overseas or switching onshore).
  - `p2-cand-se-partner` (Sweden Residence Permit to Live with a Partner — open globally to non-EU nationals applying from outside Sweden to join an eligible partner in Sweden).
- **`RESIDENCE_SPECIFIC` (`8` pathways):**
  - `p2-cand-us-stemopt` (requires maintaining F-1 status and post-completion OPT onshore in the US).
  - `p2-cand-nz-pr` (requires holding a New Zealand Resident Visa for $\ge 2$ years and demonstrating commitment to NZ).
  - `p2-cand-sg-pr` (requires holding an Employment Pass / S Pass, studying in Singapore, or qualifying family tie to a Singapore citizen/PR).
  - `p2-cand-de-citizenship` (requires $\ge 5$ years of lawful habitual residence in Germany under `§ 10 StAG`).
  - `p2-cand-fr-citizenship` (requires $\ge 5$ years of habitual regular residence in France — or 2 years for French higher education graduates — under `Code civil art. 21-15`).
  - `p2-cand-ie-citizenship` (requires 5 years / 1,825 days of reckonable residence in Ireland out of 9 years under `INCA 1956 s. 15`).
  - `p2-cand-nl-pr` (requires 5 consecutive years of lawful non-temporary residence in the Netherlands).
  - `p2-cand-jp-dependent` (requires derivative financial dependency on a principal foreign national holding a qualifying work, cultural, or student status of residence in Japan).

---

## 7. Disclosed Evidence Gaps (Zero-Fabrication & Quarantine Plan for Phase 3.9.8)

| Rank | Candidate ID | Readiness Status | Disclosed Evidence Gaps & Quarantine Handling Plan |
|---|---|---|---|
| 1 | `p2-cand-us-stemopt` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` | USCIS Form I-765 filing fee schedule subpage (`uscis.gov/g-1055`) returns WAF HTTP 403 and live service-center processing times are dynamic; Section 17 & Section 18 claims will be marked `AWAITING_VERIFICATION` and strictly quarantined (`isQuarantined: true`). |
| 2 | `p2-cand-gb-hpi` | `APPROVAL_READY` | No material gaps on the primary GOV.UK source (£880 fee, £210/£252 Ecctis fee, £1,035/yr IHS, £1,270 funds, and 3-week/8-week SLAs are all verified on-page). |
| 3 | `p2-cand-nz-pr` | `APPROVAL_READY` | No material gaps on the primary INZ source (NZD $315 fee, 2-year Resident Visa requirement, 5 commitment criteria, and 3-week [80%] processing SLA are all verified on-page). |
| 4 | `p2-cand-sg-pr` | `APPROVAL_READY` | Primary ICA page verifies PTS/Family eligibility, S$100 processing fee, S$20 Entry Permit, S$50 Re-Entry Permit, S$50 NRIC, and general 6-month processing time. |
| 5 | `p2-cand-de-citizenship` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` | Federal statute (`§ 10` & `§ 38 StAG`) verifies the 5-year residence rule, B1 language, civic test, livelihood requirement, and EUR 255/51 statutory fees; municipal `Staatsangehörigkeitsbehörde` processing queues are not set by federal statute and will be marked `AWAITING_VERIFICATION` & quarantined in Section 17. |
| 6 | `p2-cand-fr-citizenship` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` | Service-Public F2213 verifies the 5-year residence rule, EUR 55 fiscal stamp, and B1/B2 language transition, plus the 12–18 month statutory response ceiling (`Code civil art. 21-25-1`); local prefecture/SDANF actual queue averages vary by department and will be quarantined in Section 17. |
| 7 | `p2-cand-ie-citizenship` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` | Primary ISD guide verifies the 1,825/1,826-day reckonable residence requirement, 150-point identity/residence scorecard, EUR 175 application fee, and EUR 950/200 certification fee; live ISD naturalisation processing durations are operational rather than statutory and will be marked `AWAITING_VERIFICATION` & quarantined in Section 17. |
| 8 | `p2-cand-nl-pr` | `APPROVAL_READY` | No material gaps on the primary IND source (5-year continuous residence, sustainable income, civic integration exam, EUR 254 adult / EUR 70 minor fee, and 6-month statutory IND decision period are all verified on-page). |
| 9 | `p2-cand-jp-dependent` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` | Primary MOJ ISA page verifies eligible sponsor statuses, spouse/child dependency scope, periods of stay (3 months to 5 years), and required submission documents; separate regional bureau processing averages will be marked `AWAITING_VERIFICATION` & quarantined in Section 17. |
| 10 | `p2-cand-se-partner` | `APPROVAL_READY_WITH_DISCLOSED_GAPS` | Primary Migrationsverket page verifies eligible partner categories, 18+ age rule, maintenance/housing requirement (`försörjningskrav`), and application from outside Sweden; exact annual SEK maintenance standard indexed figures and live queue times hosted on subpages will be marked `AWAITING_VERIFICATION` & quarantined where not on the primary captured artifact. |

---

## 8. Duplicate-Check Results Against Priority 1 (`142`) and Completed Priority 2 (`130` — Batches 0–11)

Every proposed Batch 12 candidate was programmatically cross-checked (`phase_3_9_7_duplicate_and_evidence_check.csv`) against all `142` Priority 1 pathways (`PRIORITY1_AUDIT_PATHWAYS`) and all `130` completed Priority 2 pathways (`PRIORITY2_COMPLETED_PATHWAYS`, Batches 0–11):
- **ID Collisions:** `0 / 10`
- **Canonical URL / Official Source URL Collisions:** `0 / 10`
- **Same Legal Route Collisions:** `0 / 10`

| Rank | Candidate ID | Closest Existing Completed Pathways (P1 & P2 Batches 0–11) | Legal Distinction Verification |
|---|---|---|---|
| 1 | `p2-cand-us-stemopt` | `p1-us-f1` (F-1 Student Visa), `p2-us-j1` (J-1 Exchange Visitor), `p2-cand-us-n400` (Batch 11 N-400) | `PASS_UNIQUE_ROUTE` — 24-month STEM OPT EAD work authorization extension (`8 CFR 214.2(f)(10)(ii)(C)`, Form I-765 + Form I-983); distinct from initial consular F-1 visa issuance (`p1-us-f1`). |
| 2 | `p2-cand-gb-hpi` | `p1-gb-skilled-worker`, `p1-gb-graduate`, `p2-gb-global-talent`, `p2-gb-scaleup` | `PASS_UNIQUE_ROUTE` — Unsponsored work visa under `Appendix High Potential Individual` for graduates of top non-UK universities; distinct from the UK Graduate route (`p1-gb-graduate`, requires a UK degree). |
| 3 | `p2-cand-nz-pr` | `p2-nz-smc`, `p2-nz-straight-res`, `p2-nz-work-res`, `p2-nz-aewv` | `PASS_UNIQUE_ROUTE` — Second-stage Permanent Resident Visa (`RV2`) with indefinite travel conditions after 2+ years holding a Resident Visa; distinct from first-stage Resident Visas (`SMC`, `Straight to Residence`, `Work to Residence`). |
| 4 | `p2-cand-sg-pr` | `p1-sg-ep`, `p2-sg-onepass`, `p2-sg-pepass`, `p2-sg-entrepass` | `PASS_UNIQUE_ROUTE` — ICA Permanent Residence (`SPR` / Blue NRIC under `Immigration Act s. 10`); distinct from temporary MOM work passes. |
| 5 | `p2-cand-de-citizenship` | `p2-de-settle` (`§ 9 AufenthG`), `p1-de-eu-blue-card`, `p2-de-chancenkarte` | `PASS_UNIQUE_ROUTE` — German naturalisation/citizenship under `§ 10 StAG`; distinct from permanent residence (`Niederlassungserlaubnis § 9 AufenthG`, `p2-de-settle`). |
| 6 | `p2-cand-fr-citizenship` | `p2-cand-fr-resident10` (Batch 11 10-Year Carte de résident), `p1-fr-passeport-talent`, `p2-fr-salaried` | `PASS_UNIQUE_ROUTE` — French nationality acquisition by decree (`Code civil art. 21-15`); distinct from the 10-year permanent residence card (`p2-cand-fr-resident10`). |
| 7 | `p2-cand-ie-citizenship` | `p2-cand-ie-stamp4` (Batch 11 Stamp 4), `p1-ie-critical-skills`, `p2-ie-general-ep` | `PASS_UNIQUE_ROUTE` — Certificate of Naturalisation conferring Irish citizenship (`INCA 1956 s. 15`); distinct from Stamp 4 residence permission (`p2-cand-ie-stamp4`). |
| 8 | `p2-cand-nl-pr` | `p1-nl-kennismigrant`, `p2-nl-zoekjaar`, `p2-nl-startup`, `p2-nl-eu-blue-card` | `PASS_UNIQUE_ROUTE` — Indefinite Dutch permanent residence permit (`onbepaalde tijd` / EU long-term resident under `Vw 2000 art. 20–21`); no Dutch permanent residence route exists in Batches 0–11. |
| 9 | `p2-cand-jp-dependent` | `p2-cand-jp-pr` (Batch 11 Permanent Resident `永住者`), `p1-jp-hsw`, `p1-jp-eng-spec-hum`, `p2-jp-ssw` | `PASS_UNIQUE_ROUTE` — Derivative family Dependent status of residence (`家族滞在`, ICRRA Appended Table I-4); no Japanese family/dependent route exists in Batches 0–11. |
| 10 | `p2-cand-se-partner` | `p1-se-work-permit`, `p2-se-eu-blue-card`, `p2-se-researcher`, `p2-se-job-seeker` | `PASS_UNIQUE_ROUTE` — Family reunification residence permit (`Utlänningslagen Ch. 5 §§ 3–3b`); no Swedish family reunification route exists in Batches 0–11. |

---

## 9. Batch 12 Readiness Decision

- **Batch 12 Status:** **`READY FOR APPROVAL`** (`10 / 10` genuine pathways staged: `4 APPROVAL_READY` + `6 APPROVAL_READY_WITH_DISCLOSED_GAPS`; `0 NOT_READY`).
- All 10 candidates are backed by verified HTTP 200 direct non-homepage government/statutory URLs, verbatim titles, supporting excerpts, and explicit legal-instrument and scope classifications.

---

## 10. Strict Preservation Confirmation

- **Historical Batches 0–11:** Untouched (`130 / 210` Priority 2 pathways and `142 / 142` Priority 1 pathways preserved intact in `src/data/priority2AuditData.ts` and `src/data/priority1AuditData.ts`).
- **Production-Facing Datasets / UI / Sitemap / API:** Untouched (`0` Batch 12 candidates added to production datasets or public pages during this curation/preflight phase).
- **Databases (Production SQLite & Neon Test DB):** Untouched (`0` schema changes, `0` record changes, `0` migrations).
- **Daily Cron (`30 21 * * * UTC` in `vercel.json`):** Preserved intact.
- **Production Deployment:** Not triggered.
- **Read-Only Build & Type-Check Verification:** Executed (`compile_applet` & `lint_applet` $\rightarrow$ `0` errors).

---

## 11. Actual Work Completed vs. Remaining

- **Completed in Phase 3.9.7:**
  - Evaluated all `59` remaining real pathway probes in the authoritative candidate registry against all `142` Priority 1 and `130` completed Priority 2 pathways (Batches 0–11).
  - Confirmed `33` genuine verified candidates qualify (`ELIGIBLE_CANDIDATE`) and documented all `26` rejected/held real candidates (`2 REJECTED_DUPLICATE`, `3 QUARANTINE_EXPIRED`, `1 QUARANTINE_CONFLICT`, `10 HOLD_PARTIAL`, `10 HOLD_WAF_OR_404`) alongside the `90` permanently rejected synthetic placeholders.
  - Selected and staged a balanced, 10-country Batch 12 slate (`p2-cand-us-stemopt`, `p2-cand-gb-hpi`, `p2-cand-nz-pr`, `p2-cand-sg-pr`, `p2-cand-de-citizenship`, `p2-cand-fr-citizenship`, `p2-cand-ie-citizenship`, `p2-cand-nl-pr`, `p2-cand-jp-dependent`, `p2-cand-se-partner`) in `phase_3_9_7_proposed_batch12_candidates.json`, `phase_3_9_7_batch12_candidate_matrix.csv`, `phase_3_9_7_duplicate_and_evidence_check.csv`, and `phase_3_9_7_change_manifest.json`.
- **Exact Remaining Work:**
  - **Batch 12 Implementation (Phase 3.9.8 — blocked pending explicit approval):** Implement the `10` staged Batch 12 pathways (`300` profile sections, `220` special topics, `900` claims) to advance Priority 2 completion from `130 / 210` to `140 / 210`.
  - **Future Priority 2 Batches (Batches 13–15+):** `23` verified reserve candidates are already qualified for Batches 13–15 (`141..163`), leaving `47` additional slots (`164..210`) requiring future authoritative source curation/WAF resolution.

---

## FINAL STATUS SUMMARY — MANDATORY

- **Phase 3.9.7:** COMPLETE
- **Batch 12:** READY FOR APPROVAL
- **Priority 2:** 130 / 210 confirmed completed count
- **Number of genuine new candidates qualifying:** 33 genuine verified candidates qualify (10 staged for Batch 12 across 10 countries: 4 `APPROVAL_READY` + 6 `APPROVAL_READY_WITH_DISCLOSED_GAPS`; plus 23 verified reserve candidates ready for Batches 13–15)
- **Exact remaining work:** Implement Batch 12 (10 pathways / 300 profile sections / 220 special topics / 900 claims) in Phase 3.9.8 after explicit user approval to reach 140 / 210, followed by implementing the 23 verified reserve candidates in Batches 13–15 and curating/verifying the remaining 47 slots.
- **Next phase:** Phase 3.9.8 — Batch 12 Implementation, ONLY after my explicit approval.
