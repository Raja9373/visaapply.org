import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const SECRET_LEAK_REGEX =
  /(AIza[0-9A-Za-z_-]{35}|\bsk-[A-Za-z0-9]{20,}|\bghp_[A-Za-z0-9]{30,}|\bre_[A-Za-z0-9_]{24,}|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|postgres(?:ql)?:\/\/[^/\s"']+:[^@\s"']+@)/;

const TARGET_ROUTES = [
  { label: 'Homepage', path: '/', canonicalPrefix: 'https://www.visaapply.org/' },
  { label: 'Immigration Hub', path: '/immigration', canonicalPrefix: 'https://www.visaapply.org/immigration' },
  { label: 'Country Immigration Landing', path: '/immigration/us', canonicalPrefix: 'https://www.visaapply.org/immigration/us' },
  { label: 'Representative Visa Route', path: '/visa/us/us-h1b-specialty', canonicalPrefix: 'https://www.visaapply.org/visa/us/us-h1b-specialty' },
  { label: 'Representative Article Page', path: '/in-to-ca-tourist', canonicalPrefix: 'https://www.visaapply.org/in-to-ca-tourist' },
] as const;

function isPreviewOrigin(urlStr: string): boolean {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return (
      host.endsWith('.vercel.app') ||
      /^(?:staging|preview|visaapply-staging)\.visaapply\.org$/i.test(host)
    );
  } catch {
    return false;
  }
}

test.describe('Phase 9.3 Zero-Cost Preview Validation Suite (Desktop & Mobile)', () => {
  test('1. Desktop & Mobile: 5 required routes pass load, JS errors, canonicals, Preview noindex, responsive overflow, primary nav, accessibility (axe-core), CLS < 0.10 & secret scan', async ({
    browser,
    baseURL,
  }) => {
    const targetBase = baseURL || 'http://127.0.0.1:3000';
    const previewMode = isPreviewOrigin(targetBase);

    for (const vp of [
      { name: 'desktop', width: 1280, height: 800, isMobile: false },
      { name: 'mobile', width: 390, height: 844, isMobile: true },
    ]) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile,
      });
      const page = await ctx.newPage();

      const jsErrors: string[] = [];
      const failedCriticalRequests: string[] = [];

      page.on('pageerror', (err) => jsErrors.push(`${vp.name}: ${err.message}`));
      page.on('requestfailed', (req) => {
        const url = req.url();
        if (url.startsWith(targetBase) && !url.includes('/api/geo')) {
          failedCriticalRequests.push(`${vp.name} ${req.method()} ${url}: ${req.failure()?.errorText || 'failed'}`);
        }
      });
      page.on('response', (res) => {
        const url = res.url();
        if (url.startsWith(targetBase) && res.status() >= 500) {
          failedCriticalRequests.push(`${vp.name} HTTP ${res.status()} ${url}`);
        }
      });

      await page.addInitScript(() => {
        (window as any).__p93Cwv = { cls: 0, lcp: 0, fcp: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) (window as any).__p93Cwv.cls += entry.value || 0;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          if (entries.length) (window as any).__p93Cwv.lcp = entries[entries.length - 1].startTime || 0;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (entry.name === 'first-contentful-paint') (window as any).__p93Cwv.fcp = entry.startTime || 0;
          }
        }).observe({ type: 'paint', buffered: true });
      });

      for (const route of TARGET_ROUTES) {
        const res = await page.goto(route.path, { waitUntil: 'networkidle' });
        expect(res?.status(), `${vp.name} ${route.path} HTTP 200`).toBe(200);
        await page.waitForTimeout(300);

        // Primary navigation & main landmark present
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();

        // Canonical & Preview noindex checks
        const canonical = (await page.locator('link[rel="canonical"]').getAttribute('href')) || '';
        expect(canonical, `${vp.name} ${route.path} canonical`).toMatch(new RegExp(`^${route.canonicalPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));

        const xRobots = (res?.headers()['x-robots-tag'] || '').toLowerCase();
        const metaRobots = ((await page.locator('meta[name="robots"]').getAttribute('content')) || '').toLowerCase();
        if (previewMode) {
          expect(xRobots, `${vp.name} ${route.path} Preview X-Robots-Tag`).toContain('noindex');
          expect(metaRobots, `${vp.name} ${route.path} Preview meta robots`).toContain('noindex');
        } else {
          expect(metaRobots.length, `${vp.name} ${route.path} meta robots present`).toBeGreaterThan(0);
        }

        // Responsive layout check (no unintended horizontal page overflow)
        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(
          overflow.scrollWidth,
          `${vp.name} ${route.path} horizontal overflow (${overflow.scrollWidth}px > ${overflow.clientWidth}px)`
        ).toBeLessThanOrEqual(overflow.clientWidth + 2);

        // Core Web Vitals & CLS (< 0.10 target across all 5 routes)
        const metrics = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
          const cwv = (window as any).__p93Cwv || { cls: 0, lcp: 0, fcp: 0 };
          return {
            ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
            fcpMs: Math.round(cwv.fcp || 0),
            lcpMs: Math.round(cwv.lcp || 0),
            cls: Number((cwv.cls || 0).toFixed(4)),
          };
        });
        console.log(`PHASE93_CWV_${route.path}_${vp.name}:`, JSON.stringify(metrics));
        expect(metrics.cls, `${vp.name} ${route.path} CLS must be < 0.10`).toBeLessThan(0.10);

        // Accessibility audit using free bundled axe-core (zero critical/serious WCAG 2.2 AA violations)
        await page.addScriptTag({ content: axeSource });
        const axeViolations = await page.evaluate(async () => {
          const results = await (window as any).axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
          });
          return results.violations
            .filter((v: any) => v.impact === 'critical' || v.impact === 'serious')
            .map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
        });
        expect(axeViolations, `${vp.name} ${route.path} must have 0 critical/serious axe violations`).toEqual([]);

        // Secret leak scan
        const html = await page.content();
        expect(SECRET_LEAK_REGEX.test(html), `${vp.name} ${route.path} must not expose secrets`).toBe(false);
      }

      expect(jsErrors, `${vp.name} zero JS errors`).toEqual([]);
      expect(failedCriticalRequests, `${vp.name} zero failed critical requests`).toEqual([]);

      await ctx.close();
    }
  });

  test('2. No broken internal links on all 5 tested pages & zero production sitemap/robots contamination', async ({
    page,
    request,
  }) => {
    const discoveredInternalPaths = new Set<string>();

    for (const route of TARGET_ROUTES) {
      await page.goto(route.path, { waitUntil: 'networkidle' });
      const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map((a) => a.getAttribute('href') || '')
          .filter((h) => h.startsWith('/') && !h.startsWith('//') && !h.startsWith('/#'));
      });
      for (const href of hrefs) {
        const clean = href.split('#')[0];
        if (!clean || clean.startsWith('/admin') || clean.startsWith('/audit')) continue;
        discoveredInternalPaths.add(clean);
      }
    }

    expect(discoveredInternalPaths.size, 'Primary navigation & tested pages should contain internal links').toBeGreaterThan(5);

    const brokenLinks: Array<{ href: string; status: number }> = [];
    for (const internalHref of discoveredInternalPaths) {
      const res = await request.get(internalHref);
      if (res.status() >= 400) {
        brokenLinks.push({ href: internalHref, status: res.status() });
      }
    }
    console.log(`PHASE93_INTERNAL_LINKS_CHECKED: ${discoveredInternalPaths.size}, BROKEN: ${brokenLinks.length}`);
    expect(brokenLinks, 'Zero broken internal links across all 5 tested pages').toEqual([]);

    // Confirm robots.txt and production/candidate sitemaps contain zero staging URLs
    for (const seoFile of ['/robots.txt', '/sitemap.xml', '/sitemaps-static/sitemap-static-index.xml']) {
      const res = await request.get(seoFile);
      expect(res.status(), `${seoFile} should return 200`).toBe(200);
      const body = await res.text();
      expect(body, `${seoFile} must not reference .vercel.app`).not.toMatch(/\.vercel\.app/i);
      expect(body, `${seoFile} must not reference visaapply-staging`).not.toMatch(/visaapply-staging/i);
    }
  });
});
