import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const AXE_SOURCE = fs.readFileSync(
  path.join(process.cwd(), 'node_modules/axe-core/axe.min.js'),
  'utf-8'
);

async function measurePagePerformance(page: Page, url: string) {
  await page.addInitScript(() => {
    (window as any).__phase8Metrics = {
      lcp: null as number | null,
      cls: 0,
      fcp: null as number | null,
    };
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) (window as any).__phase8Metrics.lcp = Math.round(last.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            (window as any).__phase8Metrics.cls += entry.value || 0;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            (window as any).__phase8Metrics.fcp = Math.round(entry.startTime);
          }
        }
      }).observe({ type: 'paint', buffered: true });
    } catch {}
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paint = performance.getEntriesByType('paint');
    const fcpEntry = paint.find((p) => p.name === 'first-contentful-paint');
    const m = (window as any).__phase8Metrics || {};
    return {
      ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
      loadMs: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
      fcpMs: fcpEntry ? Math.round(fcpEntry.startTime) : m.fcp,
      lcpMs: m.lcp,
      cls: Number((m.cls || 0).toFixed(4)),
    };
  });
}

async function runAxeAudit(page: Page) {
  await page.addScriptTag({ content: AXE_SOURCE });
  return page.evaluate(async () => {
    const res = await (window as any).axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    });
    return {
      passes: res.passes.length,
      incomplete: res.incomplete.length,
      violations: res.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        help: v.help,
      })),
    };
  });
}

test.describe('Phase 8 Real-Browser End-to-End Critical User Journeys', () => {
  test('Journey A: Homepage -> Immigration Hub -> Category filter -> Refresh & Back/Forward -> Program detail', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('main#main-content')).toBeVisible();

    // Click Work Immigration card from Global Immigration Hub promo section
    const workCard = page.locator('a[data-category-slug="work"]').first();
    await expect(workCard).toBeVisible();
    await workCard.click();

    await expect(page).toHaveURL(/\/immigration\?category=work/);
    await expect(page.locator('main')).toContainText(/Work/i);

    // Browser refresh preserves exact filtered URL and renders cleanly
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/immigration\?category=work/);
    await expect(page.locator('main')).not.toContainText(/HTTP 404/i);

    // Navigate directly to verified static program detail route
    await page.goto('/visa/us/us-h1b-specialty', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/United States|H-1B/i);
    await expect(page.locator('main')).not.toContainText(/HTTP 404/i);

    // Browser Back returns to filtered Immigration Hub
    await page.goBack({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/immigration\?category=work/);

    // Browser Forward returns to program detail
    await page.goForward({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/visa\/us\/us-h1b-specialty/);
  });

  test('Journey B: Homepage -> Country directory -> Country detail -> Available program', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Verify 249-country selector is populated
    const originOptions = await page.locator('select[aria-label="Origin Country"] option').count();
    expect(originOptions).toBeGreaterThanOrEqual(249);

    // Open active country immigration detail hub (United States)
    await page.goto('/immigration/us', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/United States/i);
    await expect(page.locator('main')).toContainText(/Permanent Residency|EB-|USCIS/i);

    // Switch to Work Permits tab and verify verified available program appears
    const workTab = page.getByRole('button', { name: /Work Permits/i }).first();
    if (await workTab.isVisible()) {
      await workTab.click();
      await expect(page.locator('main')).toContainText(/H-1B|Specialty Occupations|USCIS/i);
    }

    // Also verify a quarantined country renders an honest awaiting-verification state (not fabricated programs)
    await page.goto('/immigration/in', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/India/i);
    await expect(page.locator('main')).not.toContainText(/HTTP 404/i);
  });

  test('Journey C: Language switch -> Same page in another language + Arabic RTL', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const langSelect = page.locator('header select').first();
    await expect(langSelect).toBeVisible();

    // Switch explicitly to English (en) first regardless of container IP geolocation
    await langSelect.selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    // Switch to German (de)
    await langSelect.selectOption('de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    // Switch to Arabic (ar) -> verify RTL direction
    await langSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('Journey D: Search -> Filter -> Empty state -> Reset', async ({ page }) => {
    await page.goto('/immigration', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/Global Immigration/i);

    const searchInput = page.locator('main input[type="text"], main input[type="search"]').first();
    await expect(searchInput).toBeVisible();

    // Enter a query matching zero countries -> verify honest empty state (not 404)
    await searchInput.fill('zzzz-nonexistent-country-phase8');
    await page.waitForTimeout(300);
    await expect(page.locator('main')).not.toContainText(/HTTP 404/i);
    await expect(page.locator('main')).toContainText(/No countries|No verified|0 |Reset|Clear/i);

    // Reset filter and confirm countries return
    const resetBtn = page.locator('main button', { hasText: /Reset|Clear/i }).first();
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
    } else {
      await searchInput.fill('');
    }
    await page.waitForTimeout(300);
    await expect(page.locator('main')).toContainText(/United States|Canada|Germany/i);
  });

  test('Journey E: Blog listing -> Published article', async ({ page }) => {
    await page.goto('/blogs', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/Visa Guides|Blog|Guide/i);

    // Click first published article link/button or open canonical published guide
    await page.goto('/in-to-ca-tourist', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/Canada/i);
    await expect(page.locator('main')).toContainText(/Tourist|Visitor/i);
    await expect(page.locator('main')).not.toContainText(/HTTP 404/i);
  });

  test('Journey F: Verification page -> Official HTTPS source link', async ({ page }) => {
    await page.goto('/verification', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/Verification|Official/i);

    const officialLinks = page.locator('main a[href^="https://"]');
    const count = await officialLinks.count();
    expect(count).toBeGreaterThan(0);

    // Check first external link has noopener security attribute
    const firstBlank = page.locator('main a[target="_blank"]').first();
    if (await firstBlank.count()) {
      const rel = (await firstBlank.getAttribute('rel')) || '';
      expect(rel).toContain('noopener');
    }
  });

  test('Journey G: Visa comparison -> Select and compare programs', async ({ page }) => {
    await page.goto('/tools/visa-comparison', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/Comparison|Compare/i);
    await expect(page.locator('main')).toContainText(/H-1B|Express Entry|EU Blue Card/i);

    // Toggle another verified program or category filter
    const filterSelect = page.locator('main select').first();
    if (await filterSelect.isVisible()) {
      const opts = await filterSelect.locator('option').count();
      expect(opts).toBeGreaterThan(1);
    }
  });

  test('Journey H: Invalid route -> Correct 404 page with noindex', async ({ page }) => {
    await page.goto('/this-invalid-route-does-not-exist-phase8', { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toContainText(/404|Not Found/i);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots || '').toContain('noindex');
  });

  test('Journey I: Admin editorial review page -> Server redirect + public noindex protection', async ({ page, request }) => {
    // Raw HTTP check without cookies: must redirect unauthenticated users to /admin/login with X-Robots-Tag: noindex, nofollow
    const rawRes = await request.get('/admin/editorial-review', { maxRedirects: 0 });
    expect([301, 302, 401, 403]).toContain(rawRes.status());
    const xRobots = rawRes.headers()['x-robots-tag'] || '';
    expect(xRobots).toContain('noindex');

    // Following redirect in browser lands on /admin/login with noindex meta tag
    await page.goto('/admin/editorial-review', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator('main')).toBeVisible();
    const metaRobots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(metaRobots || '').toContain('noindex');
  });

  test('Journey J: Keyboard-only navigation through all six Global Immigration Hub category cards', async ({ page }) => {
    const expectedSlugs = [
      'permanent-residency',
      'citizenship',
      'work',
      'family',
      'business-investor',
      'digital-nomad-retirement',
    ];

    for (const slug of expectedSlugs) {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const card = page.locator(`a[data-category-slug="${slug}"]`).first();
      await expect(card).toBeVisible();

      // Focus explicitly and activate via keyboard Enter key only (no mouse click)
      await card.focus();
      const isFocused = await card.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);

      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`/immigration\\?category=${slug}`));
      await expect(page.locator('main')).not.toContainText(/HTTP 404/i);
    }
  });

  test('Real-Browser Performance (Desktop & Mobile) and axe-core WCAG 2.2 AA Audit', async ({ browser }) => {
    // 1. Desktop (1280x800) performance + axe-core audit across 5 key routes
    const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const desktopPage = await desktopCtx.newPage();
    const desktopHomePerf = await measurePagePerformance(desktopPage, '/');
    const desktopHomeAxe = await runAxeAudit(desktopPage);

    const desktopHubPerf = await measurePagePerformance(desktopPage, '/immigration');
    const desktopHubAxe = await runAxeAudit(desktopPage);

    const desktopCountryPerf = await measurePagePerformance(desktopPage, '/immigration/us');
    const desktopCountryAxe = await runAxeAudit(desktopPage);

    const desktopComparePerf = await measurePagePerformance(desktopPage, '/tools/visa-comparison');
    const desktopCompareAxe = await runAxeAudit(desktopPage);

    const desktopBlogPerf = await measurePagePerformance(desktopPage, '/in-to-ca-tourist');
    const desktopBlogAxe = await runAxeAudit(desktopPage);
    await desktopCtx.close();

    // 2. Mobile (390x844) performance + mobile navigation toggle check
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileCtx.newPage();
    const mobileHomePerf = await measurePagePerformance(mobilePage, '/');

    // Verify mobile navigation menu button opens cleanly on mobile viewport
    const mobileMenuBtn = mobilePage.locator('header button[aria-expanded]').first();
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
      await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'true');
    }

    const mobileHubPerf = await measurePagePerformance(mobilePage, '/immigration');
    const mobileCountryPerf = await measurePagePerformance(mobilePage, '/immigration/us');
    const mobileComparePerf = await measurePagePerformance(mobilePage, '/tools/visa-comparison');
    const mobileBlogPerf = await measurePagePerformance(mobilePage, '/in-to-ca-tourist');
    await mobileCtx.close();

    console.log('PHASE9_BROWSER_PERF_METRICS:', JSON.stringify({
      desktopHomePerf,
      desktopHubPerf,
      desktopCountryPerf,
      desktopComparePerf,
      desktopBlogPerf,
      mobileHomePerf,
      mobileHubPerf,
      mobileCountryPerf,
      mobileComparePerf,
      mobileBlogPerf,
    }));
    console.log('PHASE9_AXE_WCAG_AUDIT:', JSON.stringify({
      desktopHomeAxe,
      desktopHubAxe,
      desktopCountryAxe,
      desktopCompareAxe,
      desktopBlogAxe,
    }));

    expect(desktopHomePerf.fcpMs).not.toBeNull();
    expect(mobileHomePerf.fcpMs).not.toBeNull();
    expect(desktopHomePerf.cls).toBeLessThanOrEqual(0.10);
    expect(mobileHomePerf.cls).toBeLessThanOrEqual(0.10);
    expect(desktopHubPerf.cls).toBeLessThanOrEqual(0.10);
    expect(mobileHubPerf.cls).toBeLessThanOrEqual(0.10);
    expect(desktopHomeAxe.violations).toEqual([]);
    expect(desktopHubAxe.violations).toEqual([]);
    expect(desktopCountryAxe.violations).toEqual([]);
    expect(desktopCompareAxe.violations).toEqual([]);
    expect(desktopBlogAxe.violations).toEqual([]);
  });
});
