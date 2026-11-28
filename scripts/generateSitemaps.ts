/**
 * Phase 9.8.5: Public Sitemap Generator (Verified-Only Eligibility Gate)
 *
 * Previously generated 89 legacy sitemap files covering 249 countries (including
 * 228 quarantined countries and 74,000+ thin/placeholder bilateral routes).
 *
 * Now delegates directly to `generateStaticSitemaps()` so all public sitemaps
 * (`public/sitemap-index.xml`, `public/sitemap_index.xml`, `public/sitemap.xml`,
 * and `public/sitemaps-static/*`) ONLY advertise verified, published, indexable
 * pages from the canonical static catalog.
 *
 * Quarantined country and program records in `data/` remain preserved untouched.
 */
import { generateStaticSitemaps } from './generateStaticSitemaps';

function main() {
  const report = generateStaticSitemaps({ updateRootPublicSitemaps: true });
  console.log('===============================================================');
  console.log(
    report.valid
      ? '✅ VERIFIED-ONLY PUBLIC SITEMAPS GENERATED (PHASE 9.8.5)'
      : '❌ PUBLIC SITEMAP VALIDATION FAILED'
  );
  console.log(`- Output Directory:        ${report.outDir}`);
  console.log(`- Public Sitemap Index:    public/sitemap-index.xml, public/sitemap_index.xml`);
  console.log(`- Flat Verified Sitemap:   public/sitemap.xml`);
  console.log(
    `- Substantive URLs:        ${report.totals.substantiveUrlsEmitted} (Hreflang links: ${report.totals.totalHreflangLinks})`
  );
  console.log(
    `- By Bucket:               core=${report.totals.byBucket.core}, countries=${report.totals.byBucket.countries}, programs=${report.totals.byBucket.programs}, routes=${report.totals.byBucket.routes}, editorial=${report.totals.byBucket.editorial}`
  );
  console.log(
    `- Excluded Quarantined:    ${report.totals.excludedSummary.quarantinedCountriesExcluded} countries, ${report.totals.excludedSummary.quarantinedOrExpiredProgramsExcluded} expired/quarantined programs, ${report.totals.excludedSummary.draftArticlesExcluded} drafts, ${report.totals.excludedSummary.uninhabitedTerritoriesExcluded} uninhabited`
  );
  console.log('===============================================================');
  process.exit(report.valid ? 0 : 1);
}

main();
