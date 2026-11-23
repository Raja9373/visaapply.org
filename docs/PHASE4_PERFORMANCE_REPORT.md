# VisaApply.org — Phase 4 Performance & Bundle Impact Report

**Phase:** Phase 4 — Static Catalog Runtime Reader, Frontend Integration & Runtime Parity Verification  
**Build Command Measured:** `vite build --minify false --sourcemap false` (apples-to-apples comparison with pre-Phase-4 baseline measured with the identical build command)

---

## 1. Static Catalog Network Payload Measurements (`public/catalog/**`)

All measurements below were collected directly from `public/catalog/**` using Node.js `fs.readFileSync` and `zlib.gzipSync`:

### A. Initial Static Catalog Startup Indexes (Hub Boot)

| Artifact | Raw Bytes | Gzip Bytes | Notes |
| --- | ---: | ---: | --- |
| `manifest.json` | 11,481 B | 3,280 B | Content-hashed catalog registry |
| `index-countries.*.json` | 47,987 B | 5,036 B | All 249 ISO directory entries |
| `index-programs.*.json` | 11,519 B | 2,648 B | All 28 verified published programs |
| `index-categories.*.json` | 1,150 B | 523 B | 7 tracked hub category facets (`249 × 7 = 1,743` slots) |
| `search-en.*.json` | 38,771 B | 5,802 B | English search index (only active `uiLang` fetched) |
| **Total Initial Hub Payload** | **110,908 B (108.31 KB)** | **17,289 B (16.88 KB)** | **Well under 150 KB raw / 25 KB gzip budget** |

### B. Lazy On-Demand Indexes & Chunks

| Artifact Group | Count | Raw Bytes | Gzip Bytes | When Fetched |
| --- | ---: | ---: | ---: | --- |
| `index-routes.*.json` (compact rule matrix) | 1 | 1,261 B | 642 B | Only on `/routes` |
| `chunks/route-overrides/{ae,in,us}.*.json` | 3 | 715 B / 674 B / 802 B (2,191 B total) | 443 B / 425 B / 489 B (1,357 B total) | Only on `/routes` or single-corridor lookup (avoids 61,752 route objects) |
| `index-official-sources.*.json` | 1 | 17,840 B | 3,210 B | Only on `/tools/source-verifier` |
| `index-changelog.*.json` | 1 | 5,586 B | 1,810 B | Lazy tab click on `/immigration` |
| `index-editorial.*.json` | 1 | 1,069 B | 443 B | Lazy tab click / idle warmup |
| `chunks/countries/{iso}.*.json` | 14 | Min 2,158 B / Max 14,362 B (`us`) / Avg 5,526 B | Avg 1,531 B (`us`: 3,042 B) | Single country only on `/immigration/:code` or comparison selection |
| `chunks/visa-details/us-TOU-001.*.json` | 1 | 2,713 B | 1,181 B | Only when opening structured detail on `us-TOU-001` |

---

## 2. JavaScript Bundle Comparison (Pre-Phase-4 Baseline vs. Phase 4 Measured `dist/assets/`)

All sizes measured on identical unminified `vite build --minify false` output for apples-to-apples comparison:

| Chunk | Pre-Phase-4 Baseline (Raw) | Phase 4 Measured (Raw) | Phase 4 Measured (Gzip) | Runtime Impact |
| --- | ---: | ---: | ---: | --- |
| `index-*.js` (App shell) | ~1,330 KB (`1.3M`) | 1,375,902 B (`1,343.65 KB`) | 321,775 B (`314.23 KB`) | +~13 KB raw for `StaticCatalogClient` singleton & feature flags; eliminates idle `/api/articles` DB call |
| `fullVisaDatabase-*.js` | ~3,395 KB (`3.3M`) | 3,395,499 B (`3,315.92 KB`) | 657,779 B (`642.36 KB`) | Remains lazy-split; **0 KB downloaded** by any Phase 4 migrated page |
| `globalImmigrationHubData-*.js` | ~109 KB (`107K`) | 94,971 B (`92.75 KB`) | 22,863 B (`22.33 KB`) | **Decoupled from default runtime** on `GlobalImmigrationHubPage`, `CountryImmigrationDetailPage`, and `VisaComparisonPage` (dynamic `import()` rollback-only) |
| `GlobalImmigrationHubPage-*.js` | Bundled w/ static hub data | 48,103 B (`46.98 KB`) | 9,323 B (`9.10 KB`) | Loads 16.88 KB gzip JSON indexes instead of eagerly importing 92.75 KB JS data module |
| `CountryImmigrationDetailPage-*.js` | ~79.9 KB (`78K`) | 96,158 B (`93.90 KB`) | 17,750 B (`17.33 KB`) | +16 KB raw for honest quarantined/uninhabited/retry/fallback UI states; **0 DB API calls**; loads single ~1.5 KB gzip country chunk instead of 92.75 KB legacy hub dataset |
| `RoutesPage-*.js` | Legacy `anyToAnyLight` | 20,113 B (`19.64 KB`) | 5,036 B (`4.92 KB`) | Loads 2.0 KB gzip (`routes` + 3 overrides) for all 248 routes per origin; **0 KB of `fullVisaDatabase`** |
| `VisaComparisonPage-*.js` | Legacy hub import | 20,481 B (`20.00 KB`) | 4,618 B (`4.51 KB`) | Loads 2.6 KB gzip `index-programs` + only selected country chunks |
| `SourceVerifierPage-*.js` | 5 hardcoded samples | 16,135 B (`15.76 KB`) | 4,218 B (`4.12 KB`) | Serves all 61 verified HTTPS sovereign sources via 3.2 KB gzip JSON |

---

## 3. Caching, Deduplication & Network Efficiency

- **Content-Hashed Immutability:** Every index and chunk URL resolved through `manifest.json` contains a 10-hex content hash (e.g., `chunks/countries/us.a84f39c1e2.json`), enabling long-lived CDN/browser `Cache-Control: public, max-age=31536000, immutable` headers in Vercel/static hosting while keeping `manifest.json` short-TTL with `ETag` revalidation.
- **In-Memory TTL & ETag `304`:** Repeat navigations across `/immigration` -> `/immigration/US` -> `/tools/visa-comparison` -> `/immigration` serve cached indexes with **0 redundant network fetches** inside the 5-minute soft TTL window and conditional `If-None-Match` (`304 Not Modified`) thereafter.
- **Concurrent Request Coalescing:** Verified in `tests/phase4_static_runtime_parity.test.ts` Test 16 — 10 concurrent calls coalesce into exactly 1 network request.
- **Zero Node Built-Ins in Browser Bundle:** Verified programmatically across every emitted `dist/assets/*.js` chunk (`ANY_NODE_IMPORTS_IN_DIST_ASSETS: 0`).
- **Remaining Bundle Opportunity (Deferred to Later Phases):** `index-*.js` (314.23 KB gzip) and `fullVisaDatabase-*.js` (642.36 KB gzip, lazy) remain large because `App.tsx` still statically hosts non-migrated legacy routes/views (`BlogArticleView`, `VerificationView`, `SitemapPage`, legacy calculators). Decomposing `App.tsx` and migrating remaining corridor guides will unlock further primary-bundle reductions once authorized in subsequent phases.
