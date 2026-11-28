import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const ROUTES_TO_AUDIT = [
  { label: 'Homepage', path: '/', expectedStatus: 200 },
  { label: 'Immigration Hub', path: '/immigration', expectedStatus: 200 },
  { label: 'US Immigration Detail', path: '/immigration/us', expectedStatus: 200 },
  { label: 'IN to CA Tourist', path: '/in-to-ca-tourist', expectedStatus: 200 },
  { label: 'Visa Comparison Tool', path: '/tools/visa-comparison', expectedStatus: 200 },
  { label: 'Arabic Homepage (RTL)', path: '/ar', expectedStatus: 200 },
  { label: 'Arabic Bilateral (RTL)', path: '/ar/in-to-ca-tourist', expectedStatus: 200 },
  { label: 'Arabic Immigration Hub (Fallback EN)', path: '/ar/immigration', expectedStatus: 200 },
  { label: 'Unknown Route 404', path: '/nonexistent-route-phase98', expectedStatus: 404 },
] as const;

const PHASE97_16_SSR_ROUTES = [
  '/',
  '/immigration',
  '/immigration/us',
  '/immigration/ca',
  '/immigration/gb',
  '/in-to-ca-tourist',
  '/in-to-us',
  '/in-to-gb-work',
  '/tools/visa-comparison',
  '/tools/cost-calculator',
  '/tools/document-checklist',
  '/visa/us/us-h1b-specialty',
  '/visa/japan/digital-nomad-visa',
  '/blogs',
  '/routes',
  '/about',
];

test.describe('Phase 9.8 Master Remediation Browser E2E & Accessibility Suite', () => {
  test('1. Desktop (1440x900) & Mobile (390x844): 9 target routes pass HTTP status, RTL/lang, noindex on 404, CWV, zero console errors, and WCAG 2.1/2.2 AA (axe-core)', async ({
    browser,
    baseURL,
  }) => {
    test.setTimeout(150_000);
    const targetBase = baseURL || 'http://127.0.0.1:3000';

    for (const vp of [
      { name: 'desktop', width: 1440, height: 900, isMobile: false },
      { name: 'mobile', width: 390, height: 844, isMobile: true },
    ]) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile,
      });
      const page = await ctx.newPage();

      const jsErrors: string[] = [];
      const failedRequests: string[] = [];
      page.on('pageerror', (err) => jsErrors.push(`${vp.name}: ${err.message}`));
      page.on('requestfailed', (req) => {
        const u = req.url();
        if (u.startsWith(targetBase) && !u.includes('/api/geo')) {
          failedRequests.push(`${vp.name} ${req.method()} ${u}: ${req.failure()?.errorText || 'failed'}`);
        }
      });

      await page.addInitScript(() => {
        (window as any).__p98Cwv = { cls: 0, lcp: 0, fcp: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) (window as any).__p98Cwv.cls += entry.value || 0;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          if (entries.length) (window as any).__p98Cwv.lcp = entries[entries.length - 1].startTime || 0;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (entry.name === 'first-contentful-paint') (window as any).__p98Cwv.fcp = entry.startTime || 0;
          }
        }).observe({ type: 'paint', buffered: true });
      });

      for (const route of ROUTES_TO_AUDIT) {
        const res = await page.goto(route.path, { waitUntil: 'networkidle' });
        expect(res?.status(), `${vp.name} ${route.path} HTTP status`).toBe(route.expectedStatus);
        await page.waitForTimeout(250);

        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();

        if (route.expectedStatus === 404) {
          const metaRobots = ((await page.locator('meta[name="robots"]').getAttribute('content')) || '').toLowerCase();
          expect(metaRobots).toContain('noindex');
          const canonicalCount = await page.locator('link[rel="canonical"]').count();
          expect(canonicalCount).toBe(0);
          await expect(page.locator('main')).toContainText(/404/i);
        } else {
          const canonical = (await page.locator('link[rel="canonical"]').getAttribute('href')) || '';
          expect(canonical.startsWith('https://www.visaapply.org/'), `${vp.name} ${route.path} canonical`).toBe(true);
        }

        if (route.path === '/ar' || route.path === '/ar/in-to-ca-tourist') {
          const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
          const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
          expect(lang).toBe('ar');
          expect(dir).toBe('rtl');
        }

        if (route.path === '/tools/visa-comparison') {
          const title = await page.title();
          expect(title).toContain('Visa Comparison');
        }

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(
          overflow.scrollWidth,
          `${vp.name} ${route.path} horizontal overflow (${overflow.scrollWidth} > ${overflow.clientWidth})`
        ).toBeLessThanOrEqual(overflow.clientWidth + 2);

        const metrics = await page.evaluate(() => {
          const cwv = (window as any).__p98Cwv || { cls: 0, lcp: 0, fcp: 0 };
          return {
            fcpMs: Math.round(cwv.fcp || 0),
            lcpMs: Math.round(cwv.lcp || 0),
            cls: Number((cwv.cls || 0).toFixed(4)),
          };
        });
        console.log(`PHASE98_CWV_${vp.name}_${route.path}:`, JSON.stringify(metrics));
        expect(metrics.cls, `${vp.name} ${route.path} CLS`).toBeLessThan(0.10);

        await page.addScriptTag({ content: axeSource });
        const axeViolations = await page.evaluate(async () => {
          const results = await (window as any).axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
          });
          return results.violations
            .filter((v: any) => v.impact === 'critical' || v.impact === 'serious')
            .map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
        });
        expect(axeViolations, `${vp.name} ${route.path} axe-core critical/serious violations`).toEqual([]);
      }

      expect(jsErrors, `${vp.name} zero uncaught JS errors`).toEqual([]);
      expect(failedRequests, `${vp.name} zero failed critical requests`).toEqual([]);
      await ctx.close();
    }
  });

  test('2. Live HTTP verification of all 16 Phase 9.7 SSR routes, true HTTP 404 endpoints, public API endpoints, and verified-only sitemaps', async ({
    request,
  }) => {
    for (const p of PHASE97_16_SSR_ROUTES) {
      const res = await request.get(p);
      expect(res.status(), `SSR route ${p} must return 200`).toBe(200);
      const html = await res.text();
      const orgMatches = html.match(/"@type"\s*:\s*"Organization"/g) || [];
      expect(orgMatches.length, `${p} must have exactly 1 Organization JSON-LD node`).toBe(1);
    }

    for (const missing of ['/nonexistent-route-audit-97f', '/zz-to-xx', '/immigration/zz', '/tools/fake-tool']) {
      const res = await request.get(missing);
      expect(res.status(), `Missing route ${missing} must return HTTP 404`).toBe(404);
      expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
    }

    for (const apiPath of ['/api/countries', '/api/guides', '/api/faq?country=us', '/api/sitemap']) {
      const res = await request.get(apiPath);
      expect(res.status(), `API ${apiPath} must return 200`).toBe(200);
      expect(res.headers()['x-content-type-options']).toBe('nosniff');
    }

    const smRes = await request.get('/sitemap-index.xml');
    expect(smRes.status()).toBe(200);
    const smBody = await smRes.text();
    expect(smBody).toContain('/sitemaps-static/sitemap-static-core.xml');
    expect(smBody).not.toContain('sitemap-routes-1.xml');
  });
});
