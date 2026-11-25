import { test, expect } from '@playwright/test';

const SIX_CATEGORY_SLUGS = [
  'permanent-residency',
  'citizenship',
  'work',
  'family',
  'business-investor',
  'digital-nomad-retirement',
] as const;

const SECRET_LEAK_REGEX =
  /(AIza[0-9A-Za-z_-]{35}|\bre_[A-Za-z0-9_]{20,}|BEGIN PRIVATE KEY|postgres(?:ql)?:\/\/[^<\s"']+)/;

function isPreviewTargetUrl(urlStr: string): boolean {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return (
      host.endsWith('.vercel.app') ||
      /^(?:staging|preview)\.visaapply\.org$/i.test(host)
    );
  } catch {
    return false;
  }
}

test.describe('Phase 9.2 Reusable Vercel Preview & Staging Verification Suite', () => {
  test('1. Core public routes, JS error monitoring, critical network health, mixed content, secrets, robots & canonical metadata', async ({
    page,
    request,
    baseURL,
  }) => {
    const targetBase = baseURL || 'http://127.0.0.1:3000';
    const isPreviewHost = isPreviewTargetUrl(targetBase);

    const jsErrors: string[] = [];
    const failedCriticalRequests: string[] = [];
    const mixedContentRequests: string[] = [];

    page.on('pageerror', (err) => {
      jsErrors.push(err.message);
    });
    page.on('requestfailed', (req) => {
      const url = req.url();
      if (url.startsWith(targetBase) && !url.includes('/api/geo')) {
        failedCriticalRequests.push(`${req.method()} ${url}: ${req.failure()?.errorText || 'failed'}`);
      }
    });
    page.on('response', (res) => {
      const url = res.url();
      if (targetBase.startsWith('https://') && url.startsWith('http://')) {
        mixedContentRequests.push(url);
      }
      if (url.startsWith(targetBase) && res.status() >= 500) {
        failedCriticalRequests.push(`HTTP ${res.status()} ${url}`);
      }
    });

    const coreRoutes = [
      '/',
      '/immigration',
      '/immigration/us',
      '/visa/us/us-h1b-specialty',
      '/tools/visa-comparison',
      '/in-to-ca-tourist',
    ];

    for (const route of coreRoutes) {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), `Route ${route} should return HTTP 200`).toBe(200);
      await expect(page.locator('main')).toBeVisible();

      // Check robots header & HTML meta
      const xRobots = (res?.headers()['x-robots-tag'] || '').toLowerCase();
      const metaRobots = ((await page.locator('meta[name="robots"]').getAttribute('content')) || '').toLowerCase();
      if (isPreviewHost) {
        expect(xRobots, `Preview route ${route} must emit X-Robots-Tag noindex`).toContain('noindex');
        expect(metaRobots, `Preview route ${route} must emit HTML meta robots noindex`).toContain('noindex');
      } else {
        expect(metaRobots.length).toBeGreaterThan(0);
      }

      // Canonical URL must always point to production origin https://www.visaapply.org
      const canonicalHref = (await page.locator('link[rel="canonical"]').getAttribute('href')) || '';
      expect(canonicalHref, `Canonical on ${route} must point to https://www.visaapply.org`).toMatch(
        /^https:\/\/www\.visaapply\.org/
      );

      // No leaked secrets in rendered page source
      const html = await page.content();
      expect(SECRET_LEAK_REGEX.test(html), `Rendered HTML on ${route} must not leak secrets`).toBe(false);
    }

    // Confirm production/candidate sitemaps contain ZERO staging/preview URLs
    for (const sitemapPath of ['/sitemap.xml', '/sitemaps-static/sitemap-static-index.xml']) {
      const smRes = await request.get(sitemapPath);
      expect(smRes.status(), `${sitemapPath} should be reachable`).toBe(200);
      const xml = await smRes.text();
      expect(xml).not.toMatch(/\.vercel\.app/i);
      expect(xml).not.toMatch(/staging\.visaapply\.org/i);
    }

    expect(jsErrors, 'Zero uncaught JS errors across core routes').toEqual([]);
    expect(failedCriticalRequests, 'Zero failed critical same-origin requests').toEqual([]);
    expect(mixedContentRequests, 'Zero mixed-content http:// assets on HTTPS preview').toEqual([]);
  });

  test('2. All six immigration category filters, direct route refresh, and browser Back/Forward', async ({ page }) => {
    for (const slug of SIX_CATEGORY_SLUGS) {
      await page.goto(`/immigration?category=${slug}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('main')).not.toContainText(/HTTP 404/i);
    }

    // Direct refresh + Back/Forward continuity
    await page.goto('/immigration?category=work', { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/immigration\?category=work/);

    await page.goto('/visa/us/us-h1b-specialty', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/H-1B|United States/i);

    await page.goBack({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/immigration\?category=work/);

    await page.goForward({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/visa\/us\/us-h1b-specialty/);
  });

  test('3. Language switching, Arabic RTL, search & empty state, 404, and admin noindex access control', async ({
    page,
    request,
  }) => {
    // Language switch & Arabic RTL
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const langSelect = page.locator('header select').first();
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    await langSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await langSelect.selectOption('en');

    // Search & empty state on /immigration
    await page.goto('/immigration', { waitUntil: 'networkidle' });
    const searchInput = page.locator('main input[type="text"], main input[type="search"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('zzzz-preview-no-match-92');
    await page.waitForTimeout(250);
    await expect(page.locator('main')).not.toContainText(/HTTP 404/i);
    await expect(page.locator('main')).toContainText(/No countries|No verified|0 |Reset|Clear/i);

    // 404 handling with noindex
    await page.goto('/nonexistent-preview-route-phase-9-2', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toContainText(/404|Not Found/i);
    const robots404 = (await page.locator('meta[name="robots"]').getAttribute('content')) || '';
    expect(robots404).toContain('noindex');

    // Admin access control & noindex
    const adminRaw = await request.get('/admin/editorial-review', { maxRedirects: 0 });
    expect([301, 302, 401, 403]).toContain(adminRaw.status());
    expect((adminRaw.headers()['x-robots-tag'] || '').toLowerCase()).toContain('noindex');

    await page.goto('/admin/editorial-review', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/login/);
    const robotsAdmin = (await page.locator('meta[name="robots"]').getAttribute('content')) || '';
    expect(robotsAdmin).toContain('noindex');
  });

  test('4. Core Web Vitals (TTFB, FCP, LCP, CLS) measurement across 5 key routes with strict /immigration/us CLS guard', async ({
    browser,
  }) => {
    const cwvRoutes = ['/', '/immigration', '/immigration/us', '/tools/visa-comparison', '/in-to-ca-tourist'];

    for (const vp of [
      { name: 'desktop', width: 1280, height: 800, isMobile: false },
      { name: 'mobile', width: 390, height: 844, isMobile: true },
    ]) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile,
      });
      const p = await ctx.newPage();
      await p.addInitScript(() => {
        (window as any).__cwv = { cls: 0, lcp: 0, fcp: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) (window as any).__cwv.cls += entry.value || 0;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          if (entries.length) (window as any).__cwv.lcp = entries[entries.length - 1].startTime || 0;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (entry.name === 'first-contentful-paint') (window as any).__cwv.fcp = entry.startTime || 0;
          }
        }).observe({ type: 'paint', buffered: true });
      });

      for (const route of cwvRoutes) {
        await p.goto(route, { waitUntil: 'networkidle' });
        await p.waitForTimeout(300);
        const metrics = await p.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
          const ttfb = nav ? Math.round(nav.responseStart - nav.requestStart) : 0;
          const cwv = (window as any).__cwv || { cls: 0, lcp: 0, fcp: 0 };
          return {
            ttfbMs: ttfb,
            fcpMs: Math.round(cwv.fcp || 0),
            lcpMs: Math.round(cwv.lcp || 0),
            cls: Number((cwv.cls || 0).toFixed(4)),
          };
        });
        console.log(`PREVIEW_CWV_${route}_${vp.name}:`, JSON.stringify(metrics));
        if (route === '/immigration/us') {
          expect(metrics.cls, `/immigration/us ${vp.name} CLS must stay <= 0.10`).toBeLessThanOrEqual(0.10);
        }
      }

      await ctx.close();
    }
  });
});
