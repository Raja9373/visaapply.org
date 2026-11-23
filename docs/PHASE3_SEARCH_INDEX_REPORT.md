# VisaApply.org — Phase 3 Search Index & Lazy-Chunk Performance Report

- **Builder Script:** `scripts/buildCatalogIndexes.ts` (`npm run catalog:build-indexes`)
- **Authoritative Input:** `data/` (pre-validated via `validateStaticCatalog()` before emission)
- **Generated Output Directory:** `public/catalog/` (derived build artifacts; never hand-edited)
- **Manifest File:** `public/catalog/manifest.json`
- **Deterministic Build Hash:** `0224697ee3466f4b6e73cebdbb5297c34d87f31f612fe387e04c506e64e33ffa`

---

## 1. Architecture & Performance Objectives

To eliminate runtime database calls while avoiding browser memory bloat across 249 countries and 61,752 potential bilateral corridors:

1. **Zero 61,752-Route Monolithic Dump (`monolithic61752RoutesAvoided: true`):** Routes are never expanded into a giant 61,752-entry JSON file. Instead, `index-routes.<hash>.json` (`1,261 B` raw / `642 B` gzip) holds compact treaty-bloc rules plus pointers to lazy per-origin curated override chunks (`chunks/route-overrides/{ae,in,us}.<hash>.json`).
2. **Content-Hashed Immutable Artifacts:** Every emitted file incorporates a 10-character SHA-256 content hash (`<name>.<hash10>.json`), enabling aggressive immutable CDN caching (`Cache-Control: public, max-age=31536000, immutable`) with instant cache busting via `public/catalog/manifest.json`.
3. **Strict Public-Only Filtering:** Quarantined/expired programs (1), draft editorial guides (3), and internal verification state are strictly excluded from public search indexes and lazy country chunks.
4. **Honest 15-Language Partial-Translation Support:** All 15 canonical languages (`en, hi, de, es, pl, fr, ar, ru, zh, ja, pt, it, nl, tr, ko`) receive a dedicated search index file (`search/search-<lang>.<hash>.json`). Each non-English index declares explicit metadata:
   - `translationCoverage.uiShellTranslated`: `true`
   - `translationCoverage.legalProgramRulesLanguage`: `"en"`
   - `translationCoverage.hasVerifiedNativeLegalTranslation`: `false`
   - `isFallbackContent`: `true` (with a localized `fallbackNotice` informing readers that statutory program summaries remain in verified English).

---

## 2. Exact Measured Payload Sizes

### A. Initial Core Browser Payload

| Artifact | File Path | Raw Bytes | Gzip Bytes | Contents |
| :--- | :--- | ---: | ---: | :--- |
| Countries Directory Index | `index-countries.7a9ed9bf96.json` | 47,987 B | 4,915 B | All 249 ISO countries with status, region, category counts, and lazy chunk pointer for active hubs |
| Published Programs Index | `index-programs.52b20ae611.json` | 11,519 B | 2,633 B | 28 `AVAILABLE_VERIFIED` + `PUBLISHED` immigration programs |
| Categories Facet Index | `index-categories.36bdfc503c.json` | 1,150 B | 523 B | 7 immigration categories with active country & program counts |
| English Search Index | `search/search-en.885f126769.json` | 38,771 B | 5,622 B | Tokenized search entries for countries, active programs, routes, and published guides |
| **Initial Core Payload Total** | *(4 core startup files)* | **99,427 B (97.1 KB)** | **13,693 B (13.4 KB)** | **< 14 KB gzipped for complete initial catalog boot** |

### B. Secondary Feature Indexes (Loaded On Demand)

| Artifact | File Path | Raw Bytes | Gzip Bytes | Contents |
| :--- | :--- | ---: | ---: | :--- |
| Compact Routes Index | `index-routes.e6fd26de57.json` | 1,261 B | 642 B | Compact bloc rules + 3 verified override chunk pointers |
| Official Sources Index | `index-official-sources.ff90dc5baa.json` | 17,840 B | 3,195 B | 61 verified official HTTPS government source records |
| Changelog Index | `index-changelog.cc564843ff.json` | 5,586 B | 1,808 B | 8 verified immigration changelog entries |
| Published Editorial Index | `index-editorial.fcbe849727.json` | 1,069 B | 443 B | 2 published Markdown guides (`in-to-ca-tourist`, `us-to-uk-tourist`) |

### C. 15-Language Search Indexes (`public/catalog/search/`)

| Language | File Path | Raw Bytes | Gzip Bytes | Legal Content Language |
| :---: | :--- | ---: | ---: | :---: |
| `en` | `search/search-en.885f126769.json` | 38,771 B | 5,622 B | Native (`en`) |
| `hi` | `search/search-hi.f567c096e2.json` | 39,183 B | 5,897 B | `en` (explicit fallback notice) |
| `de` | `search/search-de.0782eab02d.json` | 38,887 B | 5,734 B | `en` (explicit fallback notice) |
| `es` | `search/search-es.975fb35adf.json` | 38,899 B | 5,742 B | `en` (explicit fallback notice) |
| `pl` | `search/search-pl.a6e042363a.json` | 38,873 B | 5,762 B | `en` (explicit fallback notice) |
| `fr` | `search/search-fr.819cccb151.json` | 38,919 B | 5,739 B | `en` (explicit fallback notice) |
| `ar` | `search/search-ar.90d76e51c2.json` | 39,100 B | 5,877 B | `en` (explicit fallback notice) |
| `ru` | `search/search-ru.7edd09fdfa.json` | 39,143 B | 5,932 B | `en` (explicit fallback notice) |
| `zh` | `search/search-zh.7e4c451742.json` | 38,836 B | 5,864 B | `en` (explicit fallback notice) |
| `ja` | `search/search-ja.0237a4835d.json` | 38,930 B | 5,930 B | `en` (explicit fallback notice) |
| `pt` | `search/search-pt.8a4f6f49a9.json` | 38,889 B | 5,726 B | `en` (explicit fallback notice) |
| `it` | `search/search-it.5ddd604722.json` | 38,878 B | 5,710 B | `en` (explicit fallback notice) |
| `nl` | `search/search-nl.0d010e8c96.json` | 38,882 B | 5,720 B | `en` (explicit fallback notice) |
| `tr` | `search/search-tr.7b121135bd.json` | 38,886 B | 5,755 B | `en` (explicit fallback notice) |
| `ko` | `search/search-ko.7201b69eba.json` | 38,899 B | 5,878 B | `en` (explicit fallback notice) |

### D. Lazy Chunks (`public/catalog/chunks/`)

Only loaded when a visitor opens a specific country hub, visa detail page, or curated corridor:

- **14 Active Country Chunks (`chunks/countries/<iso>.<hash>.json`):** Range from `2,158 B` (`nz`, `793 B` gzip) to `14,362 B` (`us`, `3,034 B` gzip).
- **1 Verified Visa Detail Chunk (`chunks/visa-details/us-TOU-001.d5940a745a.json`):** `2,713 B` raw / `1,181 B` gzip.
- **3 Curated Route Override Chunks (`chunks/route-overrides/{ae,in,us}.<hash>.json`):** `674–802 B` raw / `425–489 B` gzip each.

### E. Aggregate Artifact Footprint

- **Total Generated Artifacts (all 15 languages + all lazy chunks + all indexes):** **752,650 B (735.0 KB) raw / 124,997 B (122.1 KB) gzip**.
- **Per-User Typical Session Download (Core + 1 Country Chunk + 1 Visa Detail):** **~16–18 KB gzipped** total.

---

## 3. CLI Usage

```bash
# Validate data/ and build all content-hashed indexes and chunks into public/catalog/
npm run catalog:build-indexes
```
