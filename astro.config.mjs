// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@lib': '/src/lib',
        '@components': '/src/components',
        '@middleware': '/src/middleware'
      }
    },
    ssr: {
      noExternal: ['@tailwindcss/vite']
    },
    build: {
      rollupOptions: {
        external: []
      }
    }
  }
});