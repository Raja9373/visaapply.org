# VISAAPPLY.ORG — CLOUDFLARE PAGES STAGING DEPLOYMENT GUIDE
## Zero-Database-First Commercial-Compatible Static Staging & Preview Procedure

- **Last Updated:** 2026-11-25
- **Hosting Platform:** **Cloudflare Pages (Free Plan)** — verified commercial-use compatible (permits commercial sites, Google AdSense, and affiliate monetization; unlimited static requests & bandwidth; 500 builds/month; automatic HTTPS; global edge CDN).
- **Architecture:** 100% static React + Vite SPA (`dist/`) with bundled static JSON catalog (`public/catalog/` → `dist/catalog/`), candidate static sitemaps (`public/sitemaps-static/` → `dist/sitemaps-static/`), edge headers (`public/_headers` → `dist/_headers`), and canonical redirects (`public/_redirects` → `dist/_redirects`). **Zero Neon, zero SQLite, and zero mandatory backend server runtime required.**
- **Authorization Gate:** Do **NOT** connect the repository, create a Cloudflare Pages project, upload builds, modify DNS, or create staging subdomains without explicit owner authorization.

---

## 1. Repository Configuration Already Prepared

The following Cloudflare Pages-native files are already committed in `public/` and automatically copied by Vite into `dist/` during `npm run build`:

1. **`public/_headers` (`dist/_headers`):**
   - Applies global security headers on `/*`:
     - `Content-Security-Policy` (mirrored from `src/utils/securityHardening.ts`, allowing AdSense, Travelpayouts, FlagCDN, Google Fonts, and read-only public weather/currency/geo endpoints while blocking `object-src 'none'` and restricting `frame-ancestors 'self'`)
     - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
     - `X-Frame-Options: SAMEORIGIN`
   - Applies CDN cache policies:
     - `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`
     - `/catalog/*` → `Content-Type: application/json; charset=utf-8` + `Cache-Control: public, max-age=300, stale-while-revalidate=3600`
     - `/locales/*` → `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
     - `/sitemaps-static/*` → `Content-Type: application/xml; charset=utf-8` + `Cache-Control: public, max-age=3600`
     - `/index.html` → `Cache-Control: public, max-age=0, must-revalidate`
   - Locks down admin paths on static hosting:
     - `/admin` and `/admin/*` → `X-Robots-Tag: noindex, nofollow, noarchive` + `Cache-Control: no-store, private`
2. **`public/_redirects` (`dist/_redirects`):**
   - Preserves canonical self-route redirects (`/in-to-in → /immigration/in 301`, `/in-to-in-* → /immigration/in 301`).
   - **Automatic Cloudflare Pages SPA Fallback:** Because `dist/` intentionally does **not** contain a static `404.html`, Cloudflare Pages automatically serves `/index.html` with HTTP `200` for all unmatched SPA routes (e.g., `/immigration`, `/immigration/us`, `/visa/us/us-h1b-specialty`, `/tools/visa-comparison`), while unrecognized client routes render the React 404 screen with `<meta name="robots" content="noindex">`.

---

## 2. Build Settings & Environment Variable Names

Use these exact settings in Cloudflare Pages (`Workers & Pages` → `Create` → `Pages` → `Connect to Git`):

| Setting | Exact Value |
| :--- | :--- |
| **Framework preset** | `Vite` (or `None` with explicit commands below) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (repository root) |
| **Node.js version** | `20` (set via `NODE_VERSION` build variable below) |

### Required & Optional Environment Variable Names (Names Only — Never Commit Secrets)

- **Required for Cloudflare Pages Static Build:**
  - `NODE_VERSION` *(set to `20` in Cloudflare Pages → Settings → Environment variables)*
- **Optional Public Static Build Flags (None Required — All Default Safely):**
  - `VITE_ENABLE_STATIC_CATALOG` *(optional; static catalog is enabled by default for all migrated pages)*
- **Do NOT Configure Legacy Server Secrets on Static Cloudflare Pages:**
  - Leave `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `CRON_SECRET`, `GEMINI_API_KEY`, `RESEND_API_KEY`, and any database URLs **unset** on pure static staging. None are needed by the static frontend, and omitting them eliminates legacy single-passphrase admin surface area.

---

## 3. GitHub Repository Connection Steps (Requires Explicit Authorization)

1. Push the verified repository branch (including `public/_headers`, `public/_redirects`, `data/`, and `public/catalog/`) to your authorized GitHub repository.
2. Log into the Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Authorize the Cloudflare Pages GitHub App strictly for the VisaApply.org repository only (least privilege — do not grant access to unrelated repositories).
4. Select the repository and configure:
   - **Project name:** `visaapply-staging` *(isolated staging project — separate from any live production host)*
   - **Production branch (for staging project):** `staging` *(or a dedicated release-candidate branch; keep `main` protected)*
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:** `NODE_VERSION` = `20`
5. Click **Save and Deploy** only after receiving explicit deployment authorization.

---

## 4. Preview Deployment Procedure (`*.pages.dev`)

- Every push to a non-production branch or Pull Request on the connected GitHub repository automatically creates an isolated Cloudflare Pages preview URL (`https://<commit-hash>.visaapply-staging.pages.dev`).
- Verify staging isolation:
  1. Confirm `*.pages.dev` preview URLs are **not** linked from production `robots.txt` or production sitemaps.
  2. Add a Cloudflare Pages **Transform Rule** (or Response Header Modification Rule) scoped ONLY to the staging hostname (`*.pages.dev` and any staging subdomain) adding:
     `X-Robots-Tag: noindex, nofollow`
     so search engines never index staging URLs.
  3. Confirm HTTPS is enforced automatically (`Always Use HTTPS` enabled).

---

## 5. Custom Staging Subdomain Procedure (Optional — Requires DNS Authorization)

> **STOP:** Do NOT create DNS records or change production DNS without explicit owner authorization.

1. In Cloudflare Dashboard → **Workers & Pages** → `visaapply-staging` → **Custom domains** → **Set up a custom domain**.
2. Enter an isolated staging subdomain such as `staging.visaapply.org` (never `www.visaapply.org` or `visaapply.org` during staging).
3. If Cloudflare manages DNS for `visaapply.org`, Cloudflare creates a proxied `CNAME` record (`staging` → `visaapply-staging.pages.dev`). If DNS is hosted externally, add the `CNAME` record manually only after explicit DNS approval.
4. Wait for TLS certificate provisioning (`Active` status) and add a **Response Header Transform Rule** matching `http.host eq "staging.visaapply.org"` that sets `X-Robots-Tag: noindex, nofollow`.
5. Optional extra protection: put `staging.visaapply.org` behind **Cloudflare Access (Zero Trust Free)** email OTP so only authorized reviewers can reach staging.

---

## 6. Post-Staging Validation Commands

Once the authorized staging URL is live, run the real CDN validation suite from a machine with Playwright and Node 20+:

```bash
# 1. Verify live Cloudflare edge headers & security posture
curl -sI https://<staging-url>/
curl -sI https://<staging-url>/assets/<main-chunk>.js
curl -sI https://<staging-url>/catalog/manifest.json
curl -sI https://<staging-url>/admin/editorial-review

# 2. Run Playwright real-browser E2E journeys against staging
BASE_URL=https://<staging-url> npm run test:e2e

# 3. Run real CDN Lighthouse audits (Desktop & Mobile) across all 5 core routes
npx lighthouse https://<staging-url>/ --preset=desktop --output=html --output-path=./lighthouse-home-desktop.html
npx lighthouse https://<staging-url>/ --form-factor=mobile --output=html --output-path=./lighthouse-home-mobile.html
npx lighthouse https://<staging-url>/immigration --preset=desktop --output=html --output-path=./lighthouse-hub-desktop.html
npx lighthouse https://<staging-url>/immigration --form-factor=mobile --output=html --output-path=./lighthouse-hub-mobile.html
npx lighthouse https://<staging-url>/immigration/us --form-factor=mobile --output=html --output-path=./lighthouse-us-mobile.html
npx lighthouse https://<staging-url>/tools/visa-comparison --form-factor=mobile --output=html --output-path=./lighthouse-compare-mobile.html
npx lighthouse https://<staging-url>/in-to-ca-tourist --form-factor=mobile --output=html --output-path=./lighthouse-blog-mobile.html
```

---

## 7. Rollback Instructions

1. **Instant Cloudflare Pages Rollback (< 30 seconds):**
   - Open Cloudflare Dashboard → **Workers & Pages** → `visaapply-staging` → **Deployments**.
   - Locate the last known-good deployment → open the `...` menu → click **Rollback to this deployment**.
2. **Git-Based Rollback:**
   - Revert the offending commit via Pull Request (never force-push `main`) so Cloudflare Pages rebuilds the previous verified state automatically.
3. **Zero Data or SEO Blast Radius:**
   - Staging uses zero Neon or SQLite databases (`data_db/` and Phase B.3 backups are untouched).
   - Legacy production sitemaps (`89` `public/sitemap*.xml` files) and `public/robots.txt` remain untouched.
   - To tear down staging completely, remove the custom staging domain (`staging.visaapply.org`) and delete the `visaapply-staging` Pages project — live production DNS and hosting remain unaffected.
