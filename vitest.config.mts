import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import {
  configDefaults,
  coverageConfigDefaults,
  defineConfig,
} from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
    coverage: {
      exclude: ['app/__tests__/**/*', ...coverageConfigDefaults.exclude],
    },
    environment: 'jsdom',
    exclude: ['app/__tests__/**/*', ...configDefaults.exclude],
    setupFiles: ['./vitest.setup.ts'],
  },
})
