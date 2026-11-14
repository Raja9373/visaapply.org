import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => {
  if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'ads.txt', 'robots.txt'],
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
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB max per cached asset
          globPatterns: ['**/*.{js,css,html,ico,png,svg}', 'manifest.webmanifest'],
          globIgnores: ['**/assets/aistudio/**', '**/sitemap*.xml', '**/*.map'],
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
          enabled: false,
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
      sourcemap: false,
      target: 'es2022',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
              if (id.includes('lucide-react')) return 'ui-icons';
              if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf-tools';
              if (id.includes('d3-geo') || id.includes('topojson') || id.includes('world-atlas') || id.includes('react-simple-maps')) {
                return 'geo-map';
              }
            }
            return undefined;
          },
        },
      },
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
