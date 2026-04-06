import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      exclude: ['tests/api/**/*.test.ts'],
    },
    esbuild: {
      // Disable Istanbul instrumentation that causes issues with import.meta.env
      jsxInject: undefined,
    },
  },
});
