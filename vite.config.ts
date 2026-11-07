import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'ads.txt', 'robots.txt', 'sitemap.xml', 'sitemap-index.xml'],
        manifest: {
          id: '/',
          name: 'VisaApply.org - Global Visa & Travel Portal',
          short_name: 'VisaApply',
          description: 'Global Visa requirements, embassy slot alerts, dummy tickets, and cover letters for 249 countries.',
          theme_color: '#0B3D91',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/favicon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MiB
          globPatterns: ['**/*.{js,css,html,ico,png,svg,xml}'],
          runtimeCaching: [
            {
              urlPattern: /\/sitemap.*\.xml$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'sitemaps-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'impact-verification-first-in-head',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            const tag = "<meta name='impact-site-verification' value='b1ae4431-d331-41dd-a031-905fa7d5844a'>";
            const cleaned = html.replace(/<meta\s+name=['"]impact-site-verification['"][^>]*>\s*/gi, '');
            return cleaned.replace(/<head>/i, `<head>\n    ${tag}`);
          },
        },
      },
    ],
    build: {
      sourcemap: true,
      target: 'es2022',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
    },
  };
});
