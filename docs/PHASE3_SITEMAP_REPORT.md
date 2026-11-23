# VisaApply.org — Phase 3 Valid-Only Static Sitemap Report

- **Generator Script:** `scripts/generateStaticSitemaps.ts` (`npm run catalog:sitemaps`)
- **Authoritative Input:** `data/` (pre-validated via `validateStaticCatalog()`)
- **Generated Output Directory:** `public/sitemaps-static/`
- **Static Sitemap Index:** `public/sitemaps-static/sitemap-static-index.xml`
- **Legacy Sitemaps (`public/sitemap*.xml`):** **Preserved untouched** (89 files, 74,245 URLs) pending Phase 4/5 cutover approval

---

## 1. Legacy vs. Valid-Only Static Sitemaps Comparison

| Metric | Legacy `public/sitemap*.xml` (Preserved) | Phase 3 `public/sitemaps-static/` (New) | Delta / Impact |
| :--- | :---: | :---: | :--- |
| **Total Sitemap XML Files** | 89 files | 6 files (1 index + 5 buckets) | Eliminates 83 thin-route shard files |
| **Total Substantive `<loc>` URLs** | 74,245 | **56** | **99.92% thin-URL reduction** |
| **Verified `xhtml:link` Hreflang Links** | Mixed / unverified route pairs | **210** | Strict `seoMetadataManager.ts` canonical & hreflang parity |
| **Quarantined Countries Included** | Included (thin placeholders) | **0** (`228` excluded) | Prevents Google crawl-budget waste & Soft-404 risk |
| **Uninhabited Territories Included** | Included | **0** (`7` excluded) | `AQ, BV, GS, HM, IO, TF, UM` excluded |
| **Expired / Discontinued Programs** | Possible drift | **0** (`1` excluded) | `pt-golden-visa-expired-realestate` excluded |
| **Draft Editorial Articles** | Excluded | **0** (`3` excluded) | `editorial/drafts/*.md` strictly excluded |
| **Unverified Thin Bilateral Routes** | ~61,749 | **0** (`61,749` excluded) | Only the 3 verified curated corridors (`ae-to-us`, `us-to-ae`, `us-to-in`) emitted |

---

## 2. Bucket Breakdown (`public/sitemaps-static/`)

| Sitemap File | Substantive URLs | Inclusion Criteria |
| :--- | :---: | :--- |
| `sitemap-static-core.xml` | **9** | Canonical core hubs (`/`, `/countries`, `/directory`, `/categories`, `/guides`, `/changelog`, `/official-sources`, `/methodology`, `/about`) with verified 15-language + `x-default` hreflang links where localized. |
| `sitemap-static-countries.xml` | **14** | Only `ACTIVE` countries backed by verified sovereign HTTPS official sources (`ae, au, ca, de, es, fr, gb, in, it, jp, nz, pt, sg, us`). |
| `sitemap-static-programs.xml` | **28** | Only `AVAILABLE_VERIFIED` + `PUBLISHED` immigration programs linked to an `ACTIVE` country and verified official source. Canonicalized via `normalizeCanonicalUrl` (e.g., `https://www.visaapply.org/visa/us/us-tou-001`). |
| `sitemap-static-routes.xml` | **3** | Only verified curated bilateral route overrides (`ae-to-us`, `us-to-ae`, `us-to-in`). |
| `sitemap-static-editorial.xml` | **2** | Only `PUBLISHED` editorial guides in `data/editorial/published/` (`in-to-ca-tourist`, `us-to-uk-tourist`). |
| **Total** | **56** | **100% verified, canonical, zero thin/quarantined/draft URLs** |

---

## 3. Canonical URL & 15-Language Hreflang Enforcement

`scripts/generateStaticSitemaps.ts` imports and delegates canonicalization directly to `src/utils/seoMetadataManager.ts`:

- **`normalizeCanonicalUrl()`:** Enforces `https://www.visaapply.org`, removes trailing slashes (except root `/`), strips query parameters/fragments, and normalizes path casing (e.g., `/visa/us/us-TOU-001` -> `https://www.visaapply.org/visa/us/us-tou-001`).
- **`getHreflangAlternatesForRoute()`:**
  - Multi-language UI shell hubs emit all 15 supported language alternates (`en, hi, de, es, pl, fr, ar, ru, zh, ja, pt, it, nl, tr, ko`) plus `x-default`.
  - English-only legal program/detail/editorial pages emit verified `en` + `x-default` alternates only, avoiding deceptive non-English hreflang claims on unlocalized legal text.
- **Strict XML Escaping & Validation:** All `<loc>` and `href` attributes are XML-escaped, deduplicated, and sorted deterministically.

---

## 4. Safe Cutover Plan (Deferred to Phase 4 / Phase 5)

In Phase 3, `public/sitemap.xml` and all 88 legacy shard files remain completely untouched so live indexing is not disrupted prematurely. Cutover in Phase 4/5 will follow three controlled steps:

1. Verify Phase 4 static catalog runtime parity across all 56 core/country/program/route/editorial URLs (HTTP 200, canonical tag match, structured data match).
2. Point `public/sitemap.xml` and `public/robots.txt` to `sitemap-static-index.xml` (or replace `public/sitemap.xml` atomically with `sitemap-static-index.xml`) in a single audited commit.
3. Submit the updated sitemap index in Google Search Console and monitor crawl stats as additional countries graduate from `QUARANTINED` to `ACTIVE` after official HTTPS verification.

---

## 5. CLI Usage

```bash
# Preview valid-only sitemap counts without writing files
./node_modules/.bin/tsx scripts/generateStaticSitemaps.ts --dry-run

# Generate valid-only static sitemaps into public/sitemaps-static/
npm run catalog:sitemaps
```
