# VisaApply.org — Phase 4 Frontend Migration Report

**Phase:** Phase 4 — Static Catalog Runtime Reader, Frontend Integration & Runtime Parity Verification  
**Architecture Direction:** Option B — Zero-Database-First / Database-Light Architecture  
**Status:** Controlled Phase 4 Implementation Complete (Awaiting Phase 5 Authorization)

---

## 1. Executive Summary

Phase 4 connects the verified Phase 3 static catalog (`public/catalog/manifest.json` + content-hashed indexes and lazy chunks) to the React 19 / Vite frontend via a strictly browser-safe runtime reader (`src/services/staticCatalogClient.ts` and `src/types/staticCatalog.ts`).

- **Public Catalog Independence Achieved for Core Migrated Pages:** The five core public immigration catalog pages now read verified data exclusively from `public/catalog/**` with **zero runtime SQLite or Neon dependency** and **zero static runtime imports** of `globalImmigrationHubData` or `fullVisaDatabase`.
- **Honest Scope Disclosure:** Only the five core public catalog pages plus the homepage idle `/api/articles` sync were migrated in Phase 4. Legacy corridor blog guides, subscriber-backed backend alerts, optional AI widgets, and Phase A authenticated admin dashboards remain on their existing legacy loaders/APIs and are explicitly inventoried below.
- **Full Rollback Safety Preserved:** Every migrated surface is gated by `isStaticCatalogEnabled(feature)` (`VITE_USE_STATIC_CATALOG`, `localStorage`, and runtime overrides). Legacy data loaders, legacy APIs (`server.ts`), SQLite/Neon packages, Phase A security controls, and all 89 legacy `public/sitemap*.xml` files remain untouched.

---

## 2. Phase 2 / Phase 3 Reconciliation Resolutions

Before frontend cutover, two documented inconsistencies between Phase 2 and Phase 3 reports were audited against source code and resolved:

### A. Schema Dependency Consistency (Zero-Dependency TypeScript vs. Zod)
- **Audit Finding:** `package.json` does **not** install `zod` in `dependencies` or `devDependencies`. Zero Zod schemas or Zod adapters exist anywhere in `src/` or `scripts/`.
- **Authoritative Validator:** `src/schemas/catalogSchemas.ts` and `src/schemas/idRules.ts` implement the authoritative **zero-dependency TypeScript runtime validator**. Phase 4's browser runtime (`src/services/staticCatalogClient.ts`) follows the exact same zero-dependency contract with lightweight browser-side fail-closed payload & trust validators.
- **Remediation Applied:** Corrected inaccurate "Zod" prose mentions in `docs/PHASE3_STATIC_CATALOG_EXPORT.md` (lines 19, 41) and `docs/PHASE3_VALIDATION_REPORT.md` (line 36). Verified automatically in `tests/phase4_static_runtime_parity.test.ts` (Test 7).

### B. Coverage Metric Consistency (1,494 vs. 1,743 Slots)
- **Audit Finding:**
  - Earlier legacy code (`src/data/globalImmigrationHubData.ts`, `src/db/sqliteCore.ts`, `src/db/postgresDatabase.ts`) hardcoded `1,494 = 249 × 6` from the pre-`tourist` era (`pr, citizenship, work, family, business, digital_nomad`).
  - Both `categoryWiseCounts` in `globalImmigrationHubData.ts` and `public/catalog/index-categories.*.json` track **7** hub categories (`pr, citizenship, work, family, business, digital_nomad, tourist`), yielding **`249 × 7 = 1,743`** tracked hub coverage slots.
  - The full Phase 2 schema (`ALLOWED_CATALOG_CATEGORIES`) defines 12 total extensible categories (adding `student`, `investor`, `retirement`, `pet_travel`, `transit`).
- **Canonical Documented Formula:** Exported in `src/services/staticCatalogClient.ts` as `CANONICAL_TRACKED_HUB_CATEGORIES` (7 keys) and `CANONICAL_COVERAGE_SLOTS_COUNT = 249 * 7 = 1743`.
- **Non-Conflation Rule:** Neither `1,743` tracked hub slots nor `249` ISO directory entries are ever presented as verified immigration programs; the current verified published catalog contains exactly **28** `AVAILABLE_VERIFIED` programs across **14** active hubs (with **228** quarantined countries awaiting official verification and **7** uninhabited territories).

---

## 3. Browser-Safe Static Catalog Runtime Architecture

### Deliverables Created
1. **`src/types/staticCatalog.ts`** — Pure TypeScript contracts matching `public/catalog/manifest.json` and every index/chunk schema (zero Node.js or DB imports).
2. **`src/services/staticCatalogClient.ts`** — `StaticCatalogClient` runtime engine:
   - **Manifest-only safe path resolution (`isSafeManifestArtifactPath`):** Rejects `..`, leading `/`, protocol schemes (`://`), query strings, fragments, null bytes, and unhashed filenames.
   - **Caching & ETag Support:** In-memory TTL cache (5-minute soft TTL) plus conditional `If-None-Match` / HTTP `304 Not Modified` revalidation.
   - **Concurrent Request Deduplication:** In-flight Promise coalescing (`inFlight` Map) prevents duplicate network requests during simultaneous component mounts.
   - **Fail-Closed Trust & Schema Validation:** Filters out any record not meeting `AVAILABLE_VERIFIED`, `PUBLISHED`, and `https://` sovereign URL rules; refuses quarantined/uninhabited country chunks.
   - **Typed Load States:** `'ok' | 'empty' | 'unavailable' | 'quarantined' | 'error'` with explicit `code`, `retryable`, and `fromCache` metadata.
   - **Compact Bilateral Route Engine (`lookupCompactRoute`, `getCompactRoutesForOrigin`):** Uses only the 1,261-byte compact matrix + 3 sparse destination override chunks (~2.19 KB total) without ever downloading 61,752 route objects or `fullVisaDatabase`.
   - **Visa Detail Renderer Adapter (`adaptStaticVisaDetailForRenderer`):** Adapts `public/catalog/chunks/visa-details/us-TOU-001.*.json` directly for `VisaDetailRenderer` without `/api/visa-details/:id`.

### Controlled Feature-Flag & Rollback Boundary
`isStaticCatalogEnabled(feature)` checks (in priority order):
1. Runtime programmatic overrides (`setStaticCatalogFeatureOverride(feature, boolean | null)` / `resetStaticCatalogFeatureOverrides()`).
2. Browser `localStorage`: global `visaapply_use_static_catalog="false"` or per-feature `visaapply_static_<feature>="false"`.
3. Build-time Vite environment variable `VITE_USE_STATIC_CATALOG` (defaults to `true` when omitted; set `"false"` to roll back cleanly).

Supported feature keys: `'hub' | 'countryDetail' | 'visaDetail' | 'routes' | 'sourceVerifier' | 'visaComparison' | 'editorial'`.

---

## 4. Complete Public Pages & APIs Migration Inventory

### A. Migrated in Phase 4 (Zero Runtime DB Dependency)

| Surface / Route | Component / File | Static Catalog Artifacts Used | Rollback Path | Notes |
| --- | --- | --- | --- | --- |
| `/immigration` & `/immigration?category=...` | `src/pages/GlobalImmigrationHubPage.tsx` | `manifest`, `index-countries`, `index-programs`, `index-categories`, `search-{lang}`, lazy `index-changelog`, lazy `index-editorial` | Dynamic `import('../data/globalImmigrationHubData')` | Preserves 249 country directory, 28 verified programs, 7 category filters, 15-language search + EN fallback notice, honest coverage breakdown |
| `/immigration/:code` | `src/pages/CountryImmigrationDetailPage.tsx` | Lazy `chunks/countries/{iso}`, lazy `chunks/visa-details/{programId}` | Dynamic `import('../data/globalImmigrationHubData')` + legacy `/api/visa-details/:id` | Eliminated SQLite-backed `fetch('/api/visa-details/...')` in static mode; renders honest states for 14 active hubs, 228 quarantined (`noindex, follow`), 7 uninhabited, and unpublished visa details |
| `/routes` | `src/pages/RoutesPage.tsx` | `index-routes` (1.26 KB), `index-countries`, 3 sparse `chunks/route-overrides/*` | Legacy `anyToAnyLight` | Distinguishes `VERIFIED_COUNTRY_OVERRIDE` (`ae-to-us`, `us-to-ae`, `us-to-in`) from generic treaty/origin classifications, uninhabited territories, and pending pairs |
| `/tools/source-verifier` | `src/pages/tools/SourceVerifierPage.tsx` | `index-official-sources`, `index-countries` | Dynamic `import('../../data/officialSourceRegistry')` | Upgraded from 5 hardcoded samples to all 61 verified HTTPS sovereign sources across 14 active hubs with honest 228-quarantined disclosure |
| `/tools/visa-comparison` | `src/pages/tools/VisaComparisonPage.tsx` | `index-programs`, `index-countries`, lazy `chunks/countries/{iso}` | Dynamic `import('../../data/globalImmigrationHubData')` | Side-by-side comparison of up to 4 verified programs from the 28-program pool with honest "Not Yet Available — Check Portal" disclosures |
| Homepage idle article sync | `src/App.tsx` (lines ~2591–2596) | `index-editorial` | Legacy `/api/articles` | Skips unnecessary DB-backed `/api/articles` background fetch during homepage boot when `editorial` flag is enabled |

### B. Already Static / Client-Only (No Database Dependency — No Migration Required)
- `CanonicalPathwayPage`, `AtlysVsVisaApplyPage`, `GoldenVisaPage`, `IntelligenceHubPage`
- Static calculators and editorial tool pages: `CostCalculatorPage`, `FundsCalculatorPage`, `StayCalculatorPage`, `TimelinePlannerPage`, `DocumentChecklistPage`, `ReadinessCheckerPage`, `FamilyPlannerPage`, `DummyTicketPage`, `CoverLetterGeneratorPage`, `PhotoResizerPage`, `SopGeneratorPage`, `BankStatementGuidePage`, `TravelInsuranceComparePage`, `Esim249Page`, `ForexCardComparePage`, `SponsorshipFinderPage`, `WorkPermitGuidePage`, `StudentVisaUniversityPage`, `PassportSevaGuidePage`, `OciPioGuidePage`, `ScholarshipFinderPage`, `VisaRejectionAppealPage`, `FlightsPage`, `VisaMapPage`, `MultiCountryPlannerPage`.

### C. Intentionally NOT Migrated in Phase 4 (Retained on Legacy Paths with Explicit Reasons)

| Surface / Route | Component(s) | Current Dependency | Exact Reason Kept on Legacy Path in Phase 4 |
| --- | --- | --- | --- |
| `/{from}-to-{to}` legacy corridor detail & `/blogs` | `BlogArticleView.tsx`, `AutoBlogger.tsx` (`BlogsPage`) | `fullVisaDatabase` (lazy), `/api/faq`, `/api/ask-faq`, `/api/articles/:slug` | Legacy 1,001+ corridor guides & Q&A endpoints exceed the 2 published static Markdown guides currently exported (`in-to-ca-tourist`, `us-to-uk-tourist`); wholesale cutover would regress existing pages |
| Homepage comparison widget, verification view & HTML sitemap | `VisaComparison.tsx`, `VerificationView.tsx`, `SitemapPage.tsx` | `countryMetaData` / lazy `fullVisaDatabase` | Coupled to legacy 1,001+ corridor catalog; slated for review after Phase 5 expansion |
| Embassy slot alerts & tracking | `EmbassySlotAlertPage.tsx`, `VisaTrackingPage.tsx` | `/api/slot-alert/subscribe`, `/api/slot-alert/status` (SQLite/Neon persistent storage) | Requires persistent backend storage for subscriber emails (PII must never live in static public files) |
| AI eligibility & chat assistants | `EligibilityChecker.tsx`, `VisaChatbot.tsx` | `/api/ai-eligibility`, Gemini runtime API | Interactive LLM endpoints require server-side proxy routes |
| Admin & internal audit consoles | `ImmigrationUpdatesPage`, `VisaManagementAdminPage`, `VisaDetailEditorPage`, `OfficialSourceMonitoringPage`, `GlobalDataCoveragePage`, `AuditPage`, `GlobalVerificationPilotPage`, `EvidenceTraceabilityAuditPage`, `GlobalVisaCoverageAuditPage` | `/api/admin/*` (Phase A session + CSRF + rate limiting + SQLite/Neon) | Protected editorial/admin write & audit workflows intentionally remain isolated behind Phase A authentication |

### D. Backend API Classification (`server.ts`)
- **Public Catalog Read APIs Bypassed by Migrated Pages:** `/api/visa-details/:id` (bypassed by `CountryImmigrationDetailPage` in static mode), `/api/articles` (bypassed by `App.tsx` idle sync in static mode). All routes remain operational in `server.ts` for rollback and non-migrated surfaces.
- **Persistent/Dynamic Public APIs Preserved:** `/api/slot-alert/*`, `/api/faq`, `/api/ask-faq`, `/api/ai-eligibility`, `/api/flights/*`.
- **Protected Admin APIs Preserved Untouched:** All `/api/admin/*` endpoints, CSRF checks, rate limits, cookie flags, and security headers from Phase A remain completely unchanged.
