# VisaApply.org - Global Visa Guides & AI Auto-Blogger

Welcome to VisaApply.org, a production-grade global visa portal built with React, Vite, Express, Tailwind CSS, and Gemini AI.

## Features
- **Geo-Location Detection**: Automatically detects the user's browsing country via Vercel headers (`x-vercel-ip-country`) or manual selection among 30+ global countries.
- **2-Step Visa Type Quiz**: Interactive wizard for selecting travel destination and visa category (Tourist, Work, Student, Family, Business, PR) with contextual follow-up questions.
- **Gemini AI Auto-Blogger Cron**: Daily cron job (`0 0 * * *` UTC) that rotates through countries and generates detailed 900-word SEO visa guides into `/content/drafts/`.
- **Admin Approval Panel**: Secure editorial dashboard at `/admin` to review drafts, trigger manual AI blog generation instantly, and publish guides live.
- **Dynamic Sitemap**: Real-time XML sitemap generated at `/api/sitemap.xml`.
- **VFS Global Official Styling**: Trustworthy Royal Blue (`#0B3D91`) and clean white UI with AdSense readiness slots (`id="ad-slot"`).

## Deployment & Setup on Vercel
1. Push this repository to GitHub and import into Vercel.
2. In Vercel Project Settings > Environment Variables, add:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `APP_URL`: `https://visaapply.org` (or your Vercel domain).
3. Connect your Cloudflare custom domain `visaapply.org` by pointing DNS CNAME records to Vercel (`cname.vercel-dns.com`).
