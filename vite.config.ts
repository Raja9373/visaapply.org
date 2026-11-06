import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: true,
    },
  };
});
